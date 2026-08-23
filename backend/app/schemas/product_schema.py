from pydantic import BaseModel
from typing import Optional

# --- Category Schemas ---
class CategoryCreate(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# --- Product Schemas ---
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category_id: int
    image: Optional[str] = None  # <--- Ajouté ici pour la création

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category_id: int
    image: Optional[str] = None  # <--- Ajouté ici pour que l'API le renvoie au Store
    category: CategoryResponse

    class Config:
        from_attributes = True