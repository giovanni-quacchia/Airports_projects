import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    # commit automatico ad ogni insert, update, delete, ma aggiunge overhead
    SQLALCHEMY_TRACK_MODIFICATIONS = False
