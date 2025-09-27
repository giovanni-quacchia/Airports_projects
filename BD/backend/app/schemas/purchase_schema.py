from marshmallow import Schema, fields, ValidationError, validates, validates_schema
from app.schemas.passenger_schema import PassengerWithSeatsSchema

class PurchaseBaseSchema(Schema):
    user = fields.Int(required=True)

class PurchaseSchema(PurchaseBaseSchema):
    quantity = fields.Int(required=True)

class PurchaseCreateSchema(PurchaseBaseSchema):
    tickets = fields.List(fields.Int(), required=True) # list of ticket IDs
    quantity = fields.Int(required=True)
    passengers = fields.List(fields.Nested(PassengerWithSeatsSchema)) # passengers with seats

    @validates_schema
    def validate_tickets(self, data, **kwargs):
        # unique ticket IDs
        tickets = data.get("tickets", [])
        seen = set()
        for ticket_id in tickets:
            if ticket_id in seen:
                raise ValidationError("A purchase must include unique ticket IDs", field_name="tickets")
            seen.add(ticket_id)
        # check all passengers.seats tickets are in purchased tickets
        for passenger in data.get("passengers", []):
            for seat in passenger.get("seats", []):
                if seat.get("ticket") not in seen:
                    raise ValidationError("All seat tickets must be included in the purchase", field_name="passengers")
        # ensure if quantity then quantity == len(passengers)
        if data.get("passengers"):
            if data["quantity"] != len(data["passengers"]):
                raise ValidationError("Quantity must match the number of passengers", field_name="quantity")


class PurchaseUpdateSchema(PurchaseBaseSchema):
    total_cost = fields.Float()  
    date = fields.DateTime()

class PurchaseSchema(PurchaseUpdateSchema):
    id = fields.Int(dump_only=True)