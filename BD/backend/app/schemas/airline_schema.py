from marshmallow import Schema, fields, ValidationError, validates

class AirlineLoginSchema(Schema):
    mail = fields.Email(required=True)
    password = fields.Str(required=True)
    newPassword = fields.Str()

    @validates("password")
    def check_password_strength(self, password, **kwargs):
        pass
        # if len(password) < 8:
        #     raise ValidationError("Password must be at least 8 characters long.")
        # if not any(char.isdigit() for char in password):
        #     raise ValidationError("Password must contain at least one digit.")
        # if not any(char.isalpha() for char in password):
        #     raise ValidationError("Password must contain at least one letter.")


class AirlinePublicSchema(Schema):
    id = fields.Int(dump_only=True)
    code = fields.Str(required=True)
    name = fields.Str(required=True)
    PIVA = fields.Str(required=True)
    logo = fields.Str(required=True)

    @validates('code')
    def validate_code(self, value, **kwargs):
        if len(value) != 2 or not value.isalpha() or not value.isupper():
            raise ValidationError("Code must be exactly 2 uppercase letters.")

class AirlineSchema(AirlinePublicSchema):
    mail = fields.Email(required=True)

class AirlineUpdateSchema(AirlineSchema):
    isFirstLogin = fields.Boolean()

class AirlineQuerySchema(Schema):
    q = fields.Str()