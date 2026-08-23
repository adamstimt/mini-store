from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.product import Category, Product
from app.schemas.product_schema import (
    CategoryCreate, CategoryResponse,
    ProductCreate, ProductResponse
)

router = APIRouter(
    tags=["Store (Categories & Products)"]
)

# --- CATEGORIES ---

@router.post("/categories/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing_cat = db.query(Category).filter(Category.name == category.name).first()
    if existing_cat:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_cat = Category(name=category.name)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.get("/categories/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


# --- PRODUCTS ---

@router.post("/products/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # التأكد من وجود الكاتيجوري، وإذا لم تكن موجودة يمكننا إنشاؤها أو إعطاء خطأ واضح
    cat = db.query(Category).filter(Category.id == product.category_id).first()
    if not cat:
        # إذا لم يتم العثور عليها بالـ ID، نبحث بالاسم أو ننشئها تلقائياً لتفادي المشكل
        raise HTTPException(status_code=404, detail="Category not found. VEUILLEZ créer la catégorie d'abord!")
    
    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category_id=product.category_id,
        image=product.image
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/products/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()