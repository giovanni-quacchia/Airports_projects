from marshmallow import Schema, fields, validates, ValidationError, validates_schema
import re

SEAT_RE = re.compile(r'^[A-Z]([1-9]\d*)$')
ALLOWED_EXTRAS = {"LARGER SEAT", "PRIORITY", "EXTRA BAG"}

class PassengerSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    surname = fields.Str(required=True)
    CF = fields.Str(allow_none=True)
    passportNumber = fields.Str(allow_none=True)
    extra = fields.List(fields.Str())
    seat = fields.Str(required=True)
    purchase_id = fields.Int(required=True)

    @validates("seat")
    def validate_seat(self, v: str):
        if not SEAT_RE.match(v or ""):
            raise ValidationError("Seat must match ^[A-Z]([1-9]\\d*)$")

    @validates("extra")
    def validate_extra(self, values):
        if values is None:
            return
        for x in values:
            if x not in ALLOWED_EXTRAS:
                raise ValidationError(f"Invalid extra: {x}")

    @validates_schema
    def validate_cf_or_passport(self, data, **kwargs):
        if not data.get("CF") and not data.get("passportNumber"):
            raise ValidationError("CF or Passport Number required", field_name="CF")

class PassengerUpdateSchema(Schema):
    name = fields.Str()
    surname = fields.Str()
    CF = fields.Str(allow_none=True)
    passportNumber = fields.Str(allow_none=True)
    extra = fields.List(fields.Str())
    seat = fields.Str()

    @validates("seat")
    def validate_seat(self, v: str):
        if not SEAT_RE.match(v or ""):
            raise ValidationError("Seat must match ^[A-Z]([1-9]\\d*)$")

    @validates("extra")
    def validate_extra(self, values):
        if values is None:
            return
        for x in values:
            if x not in ALLOWED_EXTRAS:
                raise ValidationError(f"Invalid extra: {x}")

class PassengerQuerySchema(Schema):
    CF = fields.Str()
    passportNumber = fields.Str()
    name = fields.Str()
    surname = fields.Str()
    seat = fields.Str()
    sortBy = fields.Str()
    order = fields.Str()

    @validates("sortBy")
    def validate_sortby(self, v):
        if v not in {"name", "surname", "seat", "CF", "passportNumber"}:
            raise ValidationError("Sorting parameters not valid")

    @validates("order")
    def validate_order(self, v):
        if v not in {"asc", "desc"}:
            raise ValidationError("Order parameter not valid")
