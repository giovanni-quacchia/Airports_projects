from app.models.purchase import Purchase
from sqlalchemy import or_

def get_all_purchases():
    purchases = Purchase.query.all()

    return [{
        "id": purchase.id,
        "user": purchase.user,
        "total_cost": purchase.total_cost,
        "date": purchase.date,
        "quantity": purchase.quantity
    } for purchase in purchases]

def get_purchase_by_id(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    return {
        "id": purchase.id,
        "user": purchase.user,
        "total_cost": purchase.total_cost,
        "date": purchase.date,
        "quantity": purchase.quantity
    }

# TODO: da implementare
def create_purchase(data):
    new_purchase = Purchase(
        user=data.get('user'),
        total_cost=data['total_cost'],
        date=data['date'],
        quantity=data['quantity']
    )
    new_purchase.save()
    return {
        "id": new_purchase.id,
        "user": new_purchase.user,
        "total_cost": new_purchase.total_cost,
        "date": new_purchase.date,
        "quantity": new_purchase.quantity
    }

def delete_purchase_by_id(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    purchase.delete()
    return {"message": "Purchase deleted successfully"}

def update_purchase_by_id(purchase_id, data):
    purchase = Purchase.query.get_or_404(purchase_id)
    purchase.update(data)
    return {
        "id": purchase.id,
        "user": purchase.user,
        "total_cost": purchase.total_cost,
        "date": purchase.date,
        "quantity": purchase.quantity
    }