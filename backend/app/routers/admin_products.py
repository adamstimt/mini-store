from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
import shutil
import os

from app.database import get_db
from app.models.product import Product

router = APIRouter(tags=["Admin Products"])

# 1. Endpoint ta3 GET (Afficher les produits)
@router.get("/admin/products/")
async def get_products(db: Session = Depends(get_db)):
    try:
        products = db.query(Product).all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Endpoint ta3 POST (Créer un produit avec image)
@router.post("/admin/products/")
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    stock: int = Form(0),
    description: Optional[str] = Form(""),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        image_name = None
        if file:
            image_name = file.filename
            file_location = os.path.join("static", image_name)
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(file.file, file_object)

        new_product = Product(
            name=name,
            price=price,
            category_id=category_id,
            stock=stock,
            description=description,
            image=image_name  # Enregistre bien le nom de l'image
        )
        
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {"message": "Produit t-zad b njaḥ! 🚀", "product_id": new_product.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 3. Endpoint ta3 DELETE (Supprimer un produit - C'est ce qui manquait !)
@router.delete("/admin/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit ma l9inahch")
    
    try:
        db.delete(product)
        db.commit()
        return {"message": "Produit t-naha b njaḥ! 🗑️"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))