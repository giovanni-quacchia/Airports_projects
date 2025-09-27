# app/models/passenger.py
import re
from typing import Any, Dict, Optional, List

from flask import current_app
from werkzeug.exceptions import BadRequest
from sqlalchemy.orm import declarative_base, relationship

from app.extensions import db

Base = declarative_base()

# ---- Costanti di validazione
SEAT_RE = re.compile(r'^[A-Z]([1-9]\d*)$')  # es. A1, C12
ALLOWED_EXTRAS = {"LARGER SEAT", "PRIORITY", "EXTRA BAG"}


class Passenger(db.Model):
    __tablename__ = 'passengers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)

    CF = db.Column(db.String(32), nullable=True)
    passportNumber = db.Column(db.String(32), nullable=True)

    # JSON list per portabilità; su Postgres potresti usare ARRAY(String)
    extra = db.Column(db.JSON, nullable=False, default=list)

    seat = db.Column(db.String(8), nullable=False)  # "A1", "C12", ...

    purchase_id = db.Column(
        db.Integer,
        db.ForeignKey('purchases.id', ondelete='RESTRICT'),
        nullable=False
    )
    # RELATIONSHIP non servono 
    # TODO: constraint FK (come negli altri model)
    # TODO: seat ed extra sono in un altro model (vedi schema db)
    # TODO: altri vincoli: unique CF, passportNumber ?, mettere anche onupdate

    def __init__(
        self,
        name: str,
        surname: str,
        seat: str,
        purchase_id: int,
        CF: Optional[str] = None,
        passportNumber: Optional[str] = None,
        extra: Optional[List[str]] = None,
        id: Optional[int] = None
    ):
        if id is not None:
            self.id = id
        self.name = (name or "").strip()
        self.surname = (surname or "").strip()
        self.seat = (seat or "").strip()
        self.purchase_id = purchase_id
        self.CF = (CF or None) if CF else None
        self.passportNumber = (passportNumber or None) if passportNumber else None
        self.extra = extra or []
        self._validate_model()

    def __repr__(self):
        return f"<Passenger {self.name} {self.surname} seat={self.seat}>"

    # ---------- Persistenza base
    def save(self):
        self._validate_model()
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self, data: Dict[str, Any]):
        for key in ["name", "surname", "CF", "passportNumber", "extra", "seat"]:
            if key in data:
                setattr(self, key, data[key])
        self._validate_model()
        db.session.commit()

    # TODO: validate model non serve c'è già marshmallow
    # ---------- Validazioni di modello (cross-field)
    def _validate_model(self):
        # name/surname
        if not isinstance(self.name, str) or not self.name.strip():
            raise BadRequest("name is required")
        if not isinstance(self.surname, str) or not self.surname.strip():
            raise BadRequest("surname is required")

        # Almeno uno tra CF e passportNumber
        if not (self.CF or self.passportNumber):
            raise BadRequest("CF or Passport Number required")

        # seat conforme a regex
        if not isinstance(self.seat, str) or not SEAT_RE.match(self.seat):
            raise BadRequest("Seat must match ^[A-Z]([1-9]\\d*)$")

        # extra deve essere lista di stringhe ammesse
        if self.extra is None:
            self.extra = []
        if not isinstance(self.extra, list) or any(not isinstance(x, str) for x in self.extra):
            raise BadRequest("extra must be an array of strings")
        for x in self.extra:
            if x not in ALLOWED_EXTRAS:
                raise BadRequest(f"Invalid extra: {x}")

        # purchase_id presente e valido
        if not isinstance(self.purchase_id, int):
            raise BadRequest("purchase (id) is required")

# TODO: vista? c'è gia seats public, dati passengers li lascierei nascosti?
# Tabella “pubblica” (senza dati sensibili)
class PassengerPublic(Base):
    __tablename__ = 'public_passengers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    seat = db.Column(db.String(8), nullable=False)
    # Se serve esporre anche extra pubblicamente, scommenta:
    # extra = db.Column(db.JSON, nullable=False, default=list)


# ---------- Funzioni di validazione stile Mongoose ----------
# TODO: anche qua i validate non servono c'è marshamallow
def _require_object(data: Any):
    if not isinstance(data, dict):
        raise BadRequest("Object expected")


def validate_new(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Richiede: name, surname, seat (regex), purchase (id)
    Opzionali: CF, passportNumber, extra (array di stringhe)
    Inoltre: almeno uno tra CF/passportNumber.
    """
    _require_object(data)

    out: Dict[str, Any] = {}

    # required
    try:
        out["name"] = str(data["name"]).strip()
        out["surname"] = str(data["surname"]).strip()
        out["seat"] = str(data["seat"]).strip()
        purchase_val = data.get("purchase_id", data.get("purchase"))
        if purchase_val is None:
            raise KeyError("purchase")
        out["purchase_id"] = int(purchase_val)
    except KeyError as k:
        raise BadRequest(f"Missing required field: {k.args[0]}")
    except (TypeError, ValueError):
        raise BadRequest("purchase must be a valid integer id")

    if not SEAT_RE.match(out["seat"]):
        raise BadRequest("Seat must match ^[A-Z]([1-9]\\d*)$")

    # optional
    if data.get("CF") is not None:
        out["CF"] = str(data["CF"]).strip()
    if data.get("passportNumber") is not None:
        out["passportNumber"] = str(data["passportNumber"]).strip()

    # CF o passportNumber
    if not (out.get("CF") or out.get("passportNumber")):
        raise BadRequest("CF or Passport Number required")

    # extra
    extras = data.get("extra") or []
    if not isinstance(extras, list) or any(not isinstance(x, str) for x in extras):
        raise BadRequest("extra must be an array of strings")
    for x in extras:
        if x not in ALLOWED_EXTRAS:
            raise BadRequest(f"Invalid extra: {x}")
    out["extra"] = extras

    # opzionale: rifiuta chiavi inattese (replica “isObjSameSize” rigoroso)
    allowed = {"name","surname","CF","passportNumber","extra","seat","purchase","purchase_id"}
    unexpected = set(data.keys()) - allowed
    if unexpected:
        raise BadRequest(f"Unexpected fields: {', '.join(sorted(unexpected))}")

    return out


def validate_put(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Permette aggiornare: name, surname, CF, passportNumber, extra, seat.
    Almeno un campo deve essere presente.
    """
    _require_object(data)

    allowed = {"name","surname","CF","passportNumber","extra","seat"}
    payload = {k: v for k, v in data.items() if k in allowed}

    if not payload:
        raise BadRequest("Update not valid, please provide at least a new parameter")

    if "seat" in payload:
        seat = str(payload["seat"])
        if not SEAT_RE.match(seat):
            raise BadRequest("Seat must match ^[A-Z]([1-9]\\d*)$")
        payload["seat"] = seat

    if "extra" in payload:
        extras = payload["extra"] or []
        if not isinstance(extras, list) or any(not isinstance(x, str) for x in extras):
            raise BadRequest("extra must be an array of strings")
        for x in extras:
            if x not in ALLOWED_EXTRAS:
                raise BadRequest(f"Invalid extra: {x}")
        payload["extra"] = extras

    for k in ("name","surname","CF","passportNumber"):
        if k in payload and payload[k] is not None:
            payload[k] = str(payload[k]).strip()

    return payload


def validate_search(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Campi ammessi: CF, passportNumber, name, surname, seat, sortBy, order.
    sortBy ∈ {name, surname, seat, CF, passportNumber}
    order ∈ {asc, desc} e valido solo se sortBy presente.
    """
    _require_object(data)

    out: Dict[str, Any] = {}
    for k in ("CF","passportNumber","name","surname","seat","sortBy","order"):
        if k in data and data[k] is not None:
            out[k] = str(data[k]).strip()

    if "sortBy" in out and out["sortBy"] not in {"name","surname","seat","CF","passportNumber"}:
        raise BadRequest("Sorting parameters not valid")

    if "order" in out:
        if "sortBy" not in out or out["order"] not in {"asc","desc"}:
            raise BadRequest("Order parameter not valid")

    return out


# TODO: piuttosto meglio ordinare nella query
# ---------- Helper: applicare l’ordinamento ad una query SQLAlchemy ----------
def apply_sorting(query, sortBy: Optional[str], order: Optional[str]):
    if not sortBy:
        return query
    col_map = {
        "name": Passenger.name,
        "surname": Passenger.surname,
        "seat": Passenger.seat,
        "CF": Passenger.CF,
        "passportNumber": Passenger.passportNumber,
    }
    col = col_map.get(sortBy)
    if not col:
        return query
    return query.order_by(col.desc() if order == "desc" else col.asc())
