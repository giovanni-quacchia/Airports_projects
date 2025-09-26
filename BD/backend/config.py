import os

class Config:
    
    SECRET_KEY = os.getenv("SECRET_KEY")

    DB_BASE_URI = os.getenv("DB_BASE_URI", "postgresql://")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_DBNAME", "flights_db")

    # utenti
    DB_ANONYMOUS = os.getenv("DB_ANONYMOUS", "guest:guest_password")
    DB_USER = os.getenv("DB_USER")
    DB_ADMIN = os.getenv("DB_ADMIN")
    DB_AIRLINE = os.getenv("DB_AIRLINE")

    @staticmethod
    def make_uri(user_pass):
        return f"{Config.DB_BASE_URI}{user_pass}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}"

# connessione iniziale come admin per creare il DB
Config.SQLALCHEMY_DATABASE_URI = Config.make_uri(Config.DB_ADMIN)
# true per commit automatico ad ogni insert, update, delete, ma aggiunge overhead
Config.SQLALCHEMY_TRACK_MODIFICATIONS = False
