from copy import error
from flask import jsonify
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from sqlalchemy.exc import ProgrammingError
import psycopg2

# Custom error handler for flask app
def register_error_handlers(app):   

    # Handle validation errors with marshmallow
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        messages = error.messages  # dict of field -> errors
        errors = []

        for field, errs in messages.items():
            value = getattr(error, 'data', {}).get(field, '') if hasattr(error, 'data') else ''
            for err in errs:
                if field == "_schema":
                    # attach to all fields mentioned in message or leave as general
                    errors.append(f"{err}")
                else:
                    errors.append(f"Field '{field}' with value '{value}' not valid: {err}")

        return jsonify({"msg": errors}), 400
    
    # Handle DB integrity errors
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        # Duplicate error
        if 'duplicate key value violates unique constraint' in str(error.orig):
            return jsonify({"msg": "Duplicate entry"}), 409
        # check_different_airports error
        elif 'check_different_airports' in str(error.orig):
            return jsonify({"msg": "from_airport and to_airport must be different"}), 400
        return jsonify({"msg": "Database integrity error"}), 400
    
    # Handle 400 bad request errors
    @app.errorhandler(400)
    def handle_400(error):
        return jsonify({"msg": error.description or "Bad request"}), 400
    
    # Handle ValueError exceptions
    @app.errorhandler(ValueError)
    def handle_value_error(error):
        return jsonify({"msg": str(error)}), 400
    
    # Unauthorized access: 401
    @app.errorhandler(401)
    def handle_401(error):
        return jsonify({"msg": error.description or "Unauthorized"}), 401

    # Resource not found: 404
    @app.errorhandler(404)
    def handle_404(error):
        print(error)
        return jsonify({"msg": error.description or "Resource not found"}), 404
    
    # Generic server error: 500
    @app.errorhandler(500)
    def handle_generic_error(error):
        print(str(error))
        return jsonify({"msg": "Internal server error"}), 500
    
    # Handle insufficient privilege errors
    @app.errorhandler(ProgrammingError)
    def handle_programming_error(error):
        # Handle insufficient privilege errors
        if isinstance(error.orig, psycopg2.errors.InsufficientPrivilege):
            return jsonify({"msg": "Forbidden: insufficient privileges"}), 403
       # fallback generico
        return jsonify({"msg": "Database error"}), 500