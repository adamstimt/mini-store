from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base  # ➔ Importi Base r2isi ta3 l-projet, ma t-3awdch t-creerha!

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String, default="Pending") # Pending, Shipped, Delivered...
    image_url = Column(String, nullable=True)
    
    # Relations (St3mel String References bach SQLAlchemy y-connaithom mli7)
    user = relationship("User")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False) # Prix ta3 l'produit waqt l'achat

    # Relations
    order = relationship("Order", back_populates="items")
    product = relationship("Product")