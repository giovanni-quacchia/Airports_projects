import re
from marshmallow import Schema, fields, ValidationError, validates, validates_schema
from datetime import datetime

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
        if not re.fullmatch(r'[A-Z]{2}\d+', value):
            raise ValidationError(
                "Code must start with 2 uppercase letters followed by 1 or more digits."
            )

class FlightQuerySchema(Schema):
    code = fields.Str()
    from_airport = fields.Str()
    to_airport = fields.Str()
    from_date = fields.DateTime()
    to_date = fields.DateTime()
    
    @validates('from_airport')
    def validate_from_airport(self, value, **kwargs):
        if not re.fullmatch(r'[A-Z]{3}', value):
            raise ValidationError("from_airport must be exactly 3 uppercase letters.")

    @validates('to_airport')
    def validate_to_airport(self, value, **kwargs):
        if not re.fullmatch(r'[A-Z]{3}', value):
            raise ValidationError("to_airport must be exactly 3 uppercase letters.")
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        from_date = data.get('from_date')
        to_date = data.get('to_date')
        if from_date and to_date and from_date > to_date:
            raise ValidationError("from_date must be earlier than or equal to to_date.", field_names=['from_date', 'to_date'])