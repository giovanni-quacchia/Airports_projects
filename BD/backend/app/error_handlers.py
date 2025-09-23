from flask import jsonify
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError

# Custom error handler for flask app
def register_error_handlers(app):   

    # Handle validation errors with marshmallow
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        messages = error.messages
        data = getattr(error, 'data', {})  # valori inviati, se presenti
        errors = []

        for field, errs in messages.items():
            value = data.get(field, '') if data else ''
            for err in errs:
                errors.append(f"Field '{field}' with value '{value}' not valid: {err}")

        return jsonify({"errors": errors}), 400 
    
    # Handle DB integrity errors
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        # Duplicate error
        if 'duplicate key value violates unique constraint' in str(error.orig):
            return jsonify({"error": "Duplicate entry"}), 409
        return jsonify({"error": "Database integrity error"}), 400
    
    # Resource not found: 404
    @app.errorhandler(404)
    def handle_404(error):
        return jsonify({"error": "Resource not found"}), 404
    
    # Generic server error: 500
    @app.errorhandler(500)
    def handle_generic_error(error):
        print(str(error))
        return jsonify({"error": "Internal server error"}), 500