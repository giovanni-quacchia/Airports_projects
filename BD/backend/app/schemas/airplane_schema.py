from marshmallow import Schema, fields, ValidationError, validates

class AirplaneSchema(Schema):
    model = fields.Str(required=True)
    letters = fields.Int(required=True)
    rows = fields.Int(required=True)
    airline = fields.Int(required=True)
