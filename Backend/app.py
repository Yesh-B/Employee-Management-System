from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from models import Employee
# from flask_cors import CORS

app = Flask(__name__)
# CORS(app)


# SQLite configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///employees.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Sample data
# employees = [
#     {"id": 1, "name": "James", "email": "jamie@mail.com", "position": "Manager"},
#     {"id": 2, "name": "Bond", "email": "bondo@mail.com", "position": "Developer"},
#     {"id": 3, "name": "Luke", "email": "luka@mail.com", "position": "Tester"}
# ]



############################################################
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from Flaskos!"})
############################################################

# GET all employees
@app.route("/api/employees", methods=["GET"])
def get_employees():
    employees = Employee.query.all()
    return jsonify([emp.to_dict() for emp in employees])

# GET employee bu ID
@app.route("/api/employees/<int:id>", methods=["GET"])
def get_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"error": "Employee not found"}),404
    return jsonify(employee.to_dict)
    
#POST new employee
@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.get_json()
    emp = Employee(
        name=data["name"],
        email=data["email"],
        position=data["position"]
    )
    db.session.add(emp)
    db.session.commit()
    return jsonify(emp.to_dict()), 201

# PUT update employee
@app.route("/api/employees/<int:id>", methods=["PUT"])
def update_employee(id):
    data = request.get_json()
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"error":"The employee was not found"}), 404
    
    data = request.get_json()
    employee.name = data.get("name", employee.name)
    employee.email = data.get("name", employee.email)
    employee.position = data.get("name", employee.position)

    db.session.commit()
    return jsonify(employee.to_dict()), 201

# DELETE employee
@app.route("/api/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    employee = Employee.query.get(id)
    if not employee:
        return jsonify({"Error":"Employee not found for deletion"}), 404 
    
    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message":"Employee named " + employee.name + " with id " + str(employee.id) + " deleted."}), 200

if __name__ == "__main__":
    app.run(debug=True)