from copy import error
from flask import jsonify
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError

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

        return jsonify({"errors": errors}), 400
    
    # Handle DB integrity errors
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        # Duplicate error
        print(str(error.orig))
        if 'duplicate key value violates unique constraint' in str(error.orig):
            return jsonify({"error": "Duplicate entry"}), 409
        # check_different_airports error
        elif 'check_different_airports' in str(error.orig):
            return jsonify({"error": "from_airport and to_airport must be different"}), 400
        return jsonify({"error": "Database integrity error"}), 400
    
    # Handle ValueError exceptions
    @app.errorhandler(ValueError)
    def handle_value_error(error):
        return jsonify({"error": str(error)}), 400

    # Resource not found: 404
    @app.errorhandler(404)
    def handle_404(error):
        print(error)
        return jsonify({"error": error.description or "Resource not found"}), 404
    
    # Generic server error: 500
    @app.errorhandler(500)
    def handle_generic_error(error):
        print(str(error))
        return jsonify({"error": "Internal server error"}), 500