from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.exceptions import NotFound, BadRequest

from app.models.passenger import Passenger, apply_sorting
from app.extensions import db
from app.schemas.passenger_schema import (
    PassengerSchema, PassengerUpdateSchema, PassengerQuerySchema
)

passenger_bp = Blueprint("passenger_bp", __name__)

# TODO: logica delle query in service, qui fai come negli altri routes

# --- helper ruolo admin (come nel tuo Express router per GET)
def require_admin():
    if not getattr(current_user, "is_authenticated", False) or getattr(current_user, "role", None) != "admin":
        raise BadRequest("Admin privileges required")

# GET /api/passengers  (solo admin)    ?name=&surname=&CF=&passportNumber=&seat=&sortBy=&order=
@passenger_bp.get("/")
@login_required
def get_all_passengers():
    require_admin()
    qschema = PassengerQuerySchema()
    args = qschema.load(request.args.to_dict())

    query = Passenger.query

    if "name" in args:
        query = query.filter(Passenger.name.ilike(f"%{args['name']}%"))
    if "surname" in args:
        query = query.filter(Passenger.surname.ilike(f"%{args['surname']}%"))
    if "CF" in args:
        query = query.filter(Passenger.CF == args["CF"])
    if "passportNumber" in args:
        query = query.filter(Passenger.passportNumber == args["passportNumber"])
    if "seat" in args:
        query = query.filter(Passenger.seat == args["seat"])

    query = apply_sorting(query, args.get("sortBy"), args.get("order"))
    items = query.all()

    return jsonify(PassengerSchema(many=True).dump(items)), 200

# GET /api/passengers/<id>  (solo admin)
@passenger_bp.get("/<int:pid>")
@login_required
def get_passenger(pid: int):
    require_admin()
    p = Passenger.query.get(pid)
    if not p:
        raise NotFound("Passenger not found")
    return jsonify(PassengerSchema().dump(p)), 200

# POST /api/passengers   (autenticato)
@passenger_bp.post("/")
@login_required
def create_passenger():
    schema = PassengerSchema()
    data = schema.load(request.get_json(force=True) or {})

    p = Passenger(
        name=data["name"],
        surname=data["surname"],
        seat=data["seat"],
        purchase_id=data["purchase_id"],
        CF=data.get("CF"),
        passportNumber=data.get("passportNumber"),
        extra=data.get("extra", []),
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(schema.dump(p)), 201

# PUT /api/passengers/<id>   (autenticato)
@passenger_bp.put("/<int:pid>")
@login_required
def update_passenger(pid: int):
    p = Passenger.query.get(pid)
    if not p:
        raise NotFound("Passenger not found")

    data = PassengerUpdateSchema().load(request.get_json(force=True) or {})
    if not data:
        raise BadRequest("Update not valid, please provide at least a new parameter")

    # NB: non imponiamo “CF o passportNumber” sull’update parziale; la regola rimane a livello di modello.
    for k, v in data.items():
        setattr(p, k, v)

    # valida regole cross-field
    p._validate_model()   # oppure lascia che sia il commit a sollevare
    db.session.commit()

    return jsonify(PassengerSchema().dump(p)), 200

# DELETE /api/passengers/<id>   (autenticato)
@passenger_bp.delete("/<int:pid>")
@login_required
def delete_passenger(pid: int):
    p = Passenger.query.get(pid)
    if not p:
        raise NotFound("Passenger not found")
    db.session.delete(p)
    db.session.commit()
    return jsonify({"deleted": True, "id": pid}), 200
