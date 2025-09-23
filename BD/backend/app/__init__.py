from flask import Flask
from .routes import main_blueprint
from .extensions import db

from app.routes import main_blueprint, api, airport_bp
from app.error_handlers import register_error_handlers

# Ensure stdout is line-buffered
import sys
sys.stdout.reconfigure(line_buffering=True)

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)

    register_error_handlers(app)
    register_blueprints(app)

    with app.app_context():
        db.create_all()
        print("Database tables created")

    return app

def register_blueprints(app):
    app.register_blueprint(main_blueprint)
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(airport_bp, url_prefix='/api/airports')
