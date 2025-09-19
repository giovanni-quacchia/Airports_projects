from flask import jsonify
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError

# Custom error handler for flask app
def register_error_handlers(app):   

    # Handle validation errors with marshmallow
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        messages = error.messages
        for field, errs in messages.items():
            err = errs[0]  # primo errore
            value = error.data.get(field, '') if hasattr(error, 'data') else ''
            return jsonify({"error": f"Field '{field}' with value '{value}' not valid: {err}"}), 400    
    
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