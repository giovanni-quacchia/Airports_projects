from marshmallow import Schema, fields, ValidationError, validates

class AirplaneSchema(Schema):
    id = fields.Int(dump_only=True)
    model = fields.Str(required=True)
    letters = fields.Int(required=True)
    rows = fields.Int(required=True)
    airline = fields.Int()
    
class AirplaneQuerySchema(Schema):
    model = fields.Str()
