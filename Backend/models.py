from app import db

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    position = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            "id":"self.id",
            "name": "self.name",
            "email": "self.email",
            "position": "self.position",
        }