from flask import Flask
from .routes import main_blueprint
from .extensions import db

# Ensure stdout is line-buffered
import sys
sys.stdout.reconfigure(line_buffering=True)

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("Database tables created")

    return app