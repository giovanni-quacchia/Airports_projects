from marshmallow import Schema, fields, ValidationError, validates

class AirlineCreateSchema(Schema):
    mail = fields.Email(required=True)
    code = fields.Str(required=True)
    name = fields.Str(required=True)
    PIVA = fields.Str(required=True)
    logo = fields.Str()

class AirlineUpdateSchema(Schema):
    mail = fields.Email()
    code = fields.Str()
    name = fields.Str()
    PIVA = fields.Str()
    logo = fields.Str()
    isFirstLogin = fields.Boolean()

class AirlineQuerySchema(Schema):
    q = fields.Str()