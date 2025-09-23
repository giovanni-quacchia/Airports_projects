from marshmallow import Schema, fields, ValidationError, validates

class PurchaseSchema(Schema):
    user = fields.Int(required=True)
    quantity = fields.Int(required=True) # number of passengers
    tickets = fields.List(fields.Int(), required=True) # list of ticket IDs

    @validates("quantity")
    def check_quantity_positive(self, value, **kwargs):
        if value is not None and value <= 0:
            raise ValidationError("quantity must be a positive integer.")