from marshmallow import Schema, fields, ValidationError, validates

class UserCreateSchema(Schema):
    mail = fields.Email(required=True)
    password = fields.Str(required=True)

    @validates("password")
    def check_password_strength(self, password, **kwargs):
        pass
        # if len(password) < 8:
        #     raise ValidationError("Password must be at least 8 characters long.")
        # if not any(char.isdigit() for char in password):
        #     raise ValidationError("Password must contain at least one digit.")
        # if not any(char.isalpha() for char in password):
        #     raise ValidationError("Password must contain at least one letter.")

class UserUpdateSchema(Schema):
    mail = fields.Email()
    password = fields.Str()
    isAdmin = fields.Boolean()
    balance = fields.Float()

    @validates("balance")
    def check_positive_balance(self, value, **kwargs):
        if value and value < 0:
            raise ValidationError("Balance must be non-negative.")

class UserQuerySchema(Schema):
    q = fields.Str()