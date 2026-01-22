from flask import Flask, jsonify, request
from extensions import db
from datetime import date
from models import Employee
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
CORS(app)


# SQLite configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///employees.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Create SQLAlchemy instance
# db = SQLAlchemy(app)
db.init_app(app)

from models import Employee

# TODO: Add fallback for duplicate emails 

# GET all employees
@app.route("/api/employees", methods=["GET"])
def get_employees():
    active = request.args.get("active")
    search = request.args.get("search")

    query = Employee.query

    if active is not None:
        active_bool = str(active).lower() in ["true", "1", "yes"] #makes true/false more forgiving if ever 1 or true or True is sent
        query = query.filter(Employee.is_active == active_bool)

    if search:
        query = query.filter(
            (Employee.first_name.ilike(f"%{search}%")) |
            (Employee.last_name.ilike(f"%{search}%")) |
            (Employee.email.ilike(f"%{search}%"))
        )

    employees = query.all()
    return jsonify([emp.to_dict() for emp in employees])


# GET employee bu ID
@app.route("/api/employees/<int:id>", methods=["GET"])
def get_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"error": "Employee not found"}),404
    return jsonify(employee.to_dict())
    
#POST new employee
@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.get_json()
    emp = Employee(
        first_name=data["first_name"],
        middle_name=data.get("middle_name"),
        last_name=data["last_name"],
        date_of_birth=date.fromisoformat(data["date_of_birth"]),
        email=data["email"],
        is_active=data.get("is_active", True)
    )
    try:
        db.session.add(emp)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 400
    return jsonify(emp.to_dict()), 201

# PUT update employee
@app.route("/api/employees/<int:id>", methods=["PUT"])
def update_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"error":"The employee was not found"}), 404
    
    data = request.get_json()
    employee.first_name = data.get("first_name", employee.first_name)
    employee.middle_name = data.get("middle_name", employee.middle_name)
    employee.last_name = data.get("last_name", employee.last_name)
    employee.date_of_birth = date.fromisoformat(data["date_of_birth"]) if "date_of_birth" in data else employee.date_of_birth
    employee.email = data.get("email", employee.email)
    employee.is_active = data.get("is_active", employee.is_active)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 400
    return jsonify(employee.to_dict()), 200

# DELETE employee
@app.route("/api/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"Error":"Employee not found for deletion"}), 404 
    
    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message":"Employee named " + employee.first_name + " " + employee.last_name + " with id " + str(employee.id) + " deleted."}), 200

if __name__ == '__main__':
    app.run(debug=True)