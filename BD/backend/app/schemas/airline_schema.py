from marshmallow import Schema, fields, ValidationError, validates

class AirlineCreateSchema(Schema):
    mail = fields.Email(required=True)
    code = fields.Str(required=True)
    name = fields.Str(required=True)
    PIVA = fields.Str(required=True)
    logo = fields.Str()
    
    @validates('code')
    def validate_code(self, value, **kwargs):
        if len(value) != 2 or not value.isalpha() or not value.isupper():
            raise ValidationError("Code must be exactly 2 uppercase letters.")

class AirlineUpdateSchema(AirlineCreateSchema):
    isFirstLogin = fields.Boolean()

class AirlineQuerySchema(Schema):
    q = fields.Str()