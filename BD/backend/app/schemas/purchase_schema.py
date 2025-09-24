from marshmallow import Schema, fields, ValidationError, validates

class PurchaseBaseSchema(Schema):
    user = fields.Int(required=True)
    quantity = fields.Int(required=True) # number of passengers

    @validates("quantity")
    def check_quantity_positive(self, value, **kwargs):
        if value is not None and value <= 0:
            raise ValidationError("quantity must be a positive integer.")

class PurchaseCreateSchema(PurchaseBaseSchema):
    tickets = fields.List(fields.Int(), required=True) # list of ticket IDs
    # TODO: aggiungere passegeri (anche solo posti?)

class PurchaseUpdateSchema(PurchaseBaseSchema):
    total_cost = fields.Float()  
    date = fields.DateTime()

class PurchaseSchema(PurchaseUpdateSchema):
    id = fields.Int(dump_only=True)