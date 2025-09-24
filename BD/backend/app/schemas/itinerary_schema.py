from marshmallow import Schema, fields, ValidationError, validates

class ItinerarySchema(Schema):
    id = fields.Int(dump_only=True)
    origin = fields.Str(required=True)
    destination = fields.Str(required=True)
    total_duration = fields.Int(required=True)
    total_price = fields.Float(required=True)
    flights = fields.List(fields.Dict(), required=True)