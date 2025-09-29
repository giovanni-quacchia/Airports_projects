from app.extensions import db

class Purchase(db.Model):
    __tablename__ = 'purchases'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.Integer)
    total_cost = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    quantity = db.Column(db.Integer, nullable=False)   # number of passengers, possono essere creati anche dopo l'acquisto
    
    # L'utente non può aggiornare un acquisto, perché il prezzo dei biglietti potrebbe cambiare
    # l'utente dovrebbe chiedere all'admin di cancellare un acquisto

    # Constraints
    __table_args__ = (
        # FK: On delete SET NULL to keep purchase history even if user is deleted
        db.ForeignKeyConstraint(['user'], ['users.id'], name='fk_user', onupdate='CASCADE', ondelete='SET NULL', deferrable=True, initially='DEFERRED'),

        # CHECK
        db.CheckConstraint('quantity > 0', name='ck_quantity_positive'),
        db.CheckConstraint('total_cost >= 0', name='ck_total_cost_non_negative')
    )
    
    def __repr__(self):
        return f"<Purchase User: {self.user}, Date: {self.date}, Quantity: {self.quantity}, Total Cost: {self.total_cost}>"

    def save(self):
        db.session.add(self)
        print("New purchase created:", self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def update(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()