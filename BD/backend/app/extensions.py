from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db = SQLAlchemy()
login_manager = LoginManager()

session = None

def init_session(engine):
    global session
    if session is None:
        Session = sessionmaker(bind=engine)
        session = Session()
    return session

def get_session():
    global session
    return session