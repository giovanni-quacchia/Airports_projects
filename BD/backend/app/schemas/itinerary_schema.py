from app.schemas.flight_schema import FlightQuerySchema
from marshmallow import Schema, fields, ValidationError, validates

# TODO: da sistemare
class ItinerarySchema(Schema):
    id = fields.Int(dump_only=True)
    origin = fields.Str(required=True)
    destination = fields.Str(required=True)
    total_duration = fields.Int(required=True)
    total_price = fields.Float(required=True)
    flights = fields.List(fields.Dict(), required=True)
    
class ItineraryQuerySchema(FlightQuerySchema):
    onlyDirect = fields.Bool()