from marshmallow import Schema, fields
from marshmallow.validate import Regexp

class AirportSchema(Schema):
    id = fields.Int(dump_only=True) # dump-only means it will not be required when creating a new instance
    # 3 uppercase letters
    code = fields.Str(
        required=True,
        validate=Regexp(r'^[A-Z]{3}$', error="Code must be exactly 3 uppercase letters")
    )
    name = fields.Str(required=True)
    city = fields.Str(required=True)
    country = fields.Str(required=True)
        
class AirportQuerySchema(Schema):
    q = fields.Str()