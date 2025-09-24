from flask import Flask
from .routes import main_blueprint
from .extensions import db

from app.routes import main_blueprint, api, airport_bp, route_bp, user_bp, airline_bp, purchase_bp, airplane_bp, flight_bp, ticket_bp
from app.error_handlers import register_error_handlers

from app.DB.init_db import init_db

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
        init_db()
        print("Database tables created")

    return app

def register_blueprints(app):
    app.register_blueprint(main_blueprint)
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(airport_bp, url_prefix='/api/airports')
    app.register_blueprint(route_bp, url_prefix='/api/routes')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(purchase_bp, url_prefix='/api/purchases')
    app.register_blueprint(airline_bp, url_prefix='/api/airlines')
    app.register_blueprint(airplane_bp, url_prefix='/api/airplanes')
    app.register_blueprint(flight_bp, url_prefix='/api/flights')
    app.register_blueprint(ticket_bp, url_prefix='/api/tickets')