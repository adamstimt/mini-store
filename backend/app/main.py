from fastapi import FastAPI
from app.database import engine, Base
from app.models import user, product, order
from app.routers import user_router, product_router, order_router, auth_router, admin_orders  # <--- Zid admin_orders hna
from fastapi.middleware.cors import CORSMiddleware
from app.routers import admin_products
from fastapi.staticfiles import StaticFiles


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mini Store API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # L-port ta3 React ta3ek
    allow_credentials=True,
    allow_methods=["*"],                     # Y-qbel GET, POST, PUT, DELETE... ga3 les méthodes
    allow_headers=["*"],                     # Y-qbel ga3 les headers (kima Content-Type, Authorization...)
)

app.include_router(user_router.router)
app.include_router(product_router.router)
app.include_router(order_router.router)
app.include_router(auth_router.router)
app.include_router(admin_orders.router) 
app.include_router(admin_products.router)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Mini Store API - Everything is working!"}