from marshmallow import Schema, fields, ValidationError, validates

# --- Funzioni di validazione riutilizzabili ---
def validate_non_negative_price(value):
    if value is not None and value < 0:
        raise ValidationError("price must be a non-negative number.")

def validate_non_negative_quantity(value):
    if value is not None and value < 0:
        raise ValidationError("quantity must be a non-negative integer.")

def validate_ticket_type(value):
    valid_types = ['ECONOMY', 'BUSINESS', 'FIRST CLASS']
    if value not in valid_types:
        raise ValidationError(f"type must be one of {valid_types}.")

# --- Schemi ---
class TicketSchema(Schema):
    id = fields.Int(dump_only=True)
    flight = fields.Int(required=True)
    type = fields.Str(required=True)
    price = fields.Float(required=True)
    quantity = fields.Int(required=True)

    @validates("price")
    def check_price(self, value, **kwargs):
        validate_non_negative_price(value)

    @validates("quantity")
    def check_quantity(self, value, **kwargs):
        validate_non_negative_quantity(value)

    @validates("type")
    def check_type(self, value, **kwargs):
        validate_ticket_type(value)


class TicketQuerySchema(Schema):
    type = fields.Str(required=False)
    min_price = fields.Float(required=False)
    max_price = fields.Float(required=False)
    min_quantity = fields.Int(required=False)
    max_quantity = fields.Int(required=False)

    @validates("min_price")
    def check_min_price(self, value, **kwargs):
        validate_non_negative_price(value)

    @validates("max_price")
    def check_max_price(self, value, **kwargs):
        validate_non_negative_price(value)

    @validates("min_quantity")
    def check_min_quantity(self, value, **kwargs):
        validate_non_negative_quantity(value)

    @validates("max_quantity")
    def check_max_quantity(self, value, **kwargs):
        validate_non_negative_quantity(value)

    @validates("type")
    def check_type(self, value, **kwargs):
        validate_ticket_type(value)
