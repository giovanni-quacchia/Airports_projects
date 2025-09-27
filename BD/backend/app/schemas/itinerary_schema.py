from app.schemas.flight_schema import FlightQuerySchema
from marshmallow import Schema, fields
from datetime import datetime

class ItineraryFlight(Schema):
    id = fields.Int(required=True)
    code = fields.Str(required=True)
    departure = fields.Str(required=True)
    arrival = fields.Str(required=True)
    duration = fields.Integer(required=True)
    from_ = fields.Str(required=True)
    to_ = fields.Str(required=True)

class ItinerarySchema(Schema):
    id = fields.Int(load_only=True) # no in output
    flight1 = fields.Nested(ItineraryFlight)  
    flight2 = fields.Nested(ItineraryFlight)
    stop_time = fields.Str()
    tot_duration = fields.Integer()

class ItineraryQuerySchema(FlightQuerySchema):
    onlyDirect = fields.Bool()