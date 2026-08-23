import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Charger les variables d'environnement men .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Vérification ta3 .env
if not DATABASE_URL:
    raise ValueError("❌ Error: DATABASE_URL ma rahich kayna fel fichier .env!")

# 2. Créer l'engine SQLAlchemy (L'moteur li y'connecti m3a PostgreSQL)
engine = create_engine(DATABASE_URL)

# 3. Créer SessionLocal (Kifech n'ouvrirou w n'fermou connexion m3a l'BDD)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base ta3 les models
Base = declarative_base()

# 5. Dependency `get_db` (N'utilisiwoha f les routers bach n'ouffriw session)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 6. Test ta3 la connexion (Ki t'executi l'fichier direct)
if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("🎉 Connexion m3a PostgreSQL rahi temchi 100/100!")
    except Exception as e:
        print(f"❌ Error fel connexion: {e}")