from flask import Flask
from flask_cors import CORS
from .extensions import db, login_manager

from app.routes import main_blueprint, api, airport_bp, route_bp, user_bp, airline_bp, purchase_bp, airplane_bp, flight_bp, ticket_bp, itinerary_bp, passenger_bp, seat_bp
from app.error_handlers import register_error_handlers

# Ensure stdout is line-buffered
import sys
sys.stdout.reconfigure(line_buffering=True)

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False

    CORS(
        app,
        origins=["http://localhost:4200"],     # front-end consentito
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # metodi consentiti
        allow_headers=["Content-Type", "Authorization"],     # header consentiti
        supports_credentials=True             # permette l’invio dei cookie
    )

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'user_bp.login'  # endpoint per login se non autenticato

    register_error_handlers(app)
    register_blueprints(app)

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
    app.register_blueprint(itinerary_bp, url_prefix='/api/itineraries')
    app.register_blueprint(passenger_bp, url_prefix='/api/passengers')
    app.register_blueprint(seat_bp, url_prefix='/api/seats')