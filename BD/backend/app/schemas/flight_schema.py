from marshmallow import Schema, fields, ValidationError, validates

class FlightSchema(Schema):
    id = fields.Int(dump_only=True)
    code = fields.Str(required=True)
    
    departure = fields.DateTime(required=True)
    arrival = fields.DateTime(required=True)
    duration = fields.Int(required=True)
    
    route = fields.Int(required=True)
    airline = fields.Int(required=True)
    airplane = fields.Int(required=True)
    
    @validates('code')
    def validate_code(self, value, **kwargs):
        if len(value) < 3:
            raise ValidationError("Code must be at least 3 characters: 2 letters + 1+ numbers.")
        prefix, number_part = value[:2], value[2:]
        if not prefix.isalpha() or not prefix.isupper():
            raise ValidationError("The first two characters must be uppercase letters.")
        if not number_part.isdigit():
            raise ValidationError("The remaining characters must be numeric.")

class FlightQuerySchema(Schema):
    code = fields.Str()