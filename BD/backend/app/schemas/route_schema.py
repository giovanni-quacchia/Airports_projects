from marshmallow import Schema, fields, ValidationError, validates_schema
from app.schemas.airport_schema import AirportSchema
        
class RouteSchema(Schema):
    from_airport = fields.Int(required=True)
    to_airport = fields.Int(required=True)
    
    @validates_schema
    def check_from_not_to(self, data, **kwargs):
        if data.get('from_airport') is not None and data.get('to_airport') is not None:
            if data.get('from_airport') == data.get('to_airport'):
                raise ValidationError("from_airport and to_airport must be different.", field_names=['from_airport', 'to_airport'])

class RouteGetSchema(Schema):
    id = fields.Int(dump_only=True)
    from_airport = fields.Nested(AirportSchema)
    to_airport = fields.Nested(AirportSchema)

class RouteQuerySchema(Schema):
    from_airport = fields.Str()
    to_airport = fields.Str()