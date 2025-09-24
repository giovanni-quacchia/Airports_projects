from marshmallow import Schema, fields, ValidationError, validates

class AirplaneSchema(Schema):
    code = fields.Str(required=True)
    model = fields.Str(required=True)
    letters = fields.Int(required=True)
    rows = fields.Int(required=True)
    airline = fields.Int(required=True)
