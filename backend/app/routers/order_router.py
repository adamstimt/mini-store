from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order_schema import OrderCreate, OrderResponse
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

UPLOAD_DIR = "static/orders"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 1. Récupérer les commandes de l'utilisateur connecté
@router.get("/", response_model=List[OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders

# 2. Créer une commande avec vérification et diminution du stock
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: OrderCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    total_order_price = 0.0
    order_items_data = []

    # Première boucle : Vérifier l'existence de chaque produit et la disponibilité du stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=404, 
                detail=f"Produit avec l'id {item.product_id} introuvable."
            )
        
        # Vérifier si le stock est suffisant
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuffisant pour le produit '{product.name}'. Stock actuel : {product.stock}, demandé : {item.quantity}."
            )
        
        item_total_price = product.price * item.quantity
        total_order_price += item_total_price

        order_items_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "price": product.price
        })

    # Création de la commande principale
    new_order = Order(
        user_id=current_user.id,
        total_price=total_order_price,
        status="Pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Deuxième boucle : Ajouter les items de la commande ET décrémenter le stock
    for item_data in order_items_data:
        # 1. Création de l'item de commande
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)

        # 2. Diminution du stock du produit correspondant
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        if product:
            product.stock -= item_data["quantity"]

    # Commit final pour enregistrer les items et la mise à jour des stocks en même temps
    db.commit()
    db.refresh(new_order)
    
    return new_order


# 3. Endpoint optionnel si vous voulez uploader un reçu de paiement ou une image avec la commande
@router.post("/with-receipt/")
async def create_order_with_receipt(
    total_price: float = Form(...),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = None
    if image:
        file_location = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(image.file, file_object)
        image_url = f"/{file_location}"

    new_order = Order(
        user_id=current_user.id,
        total_price=total_price,
        image_url=image_url,
        status="Pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return {"message": "Commande avec reçu t-zadet b njaḥ!", "order": new_order}