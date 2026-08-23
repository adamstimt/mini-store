from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order

router = APIRouter(prefix="/orders", tags=["Admin Orders"])

@router.put("/{order_id}/status")
def update_order_status(
    order_id: int, 
    new_status: str, # e.g., 'Pending', 'Processing', 'Delivered', 'Cancelled'
    db: Session = Depends(get_db)
):
    # Hawes 3la l-commande b id
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Commande ma tkounch mawjouda!"
        )
    
    # Update status
    order.status = new_status
    db.commit()
    db.refresh(order)
    
    return {
        "message": f"Status ta3 commande #{order.id} t-badal b njaḥ l '{new_status}'! 🚀",
        "order_id": order.id,
        "new_status": order.status
    }