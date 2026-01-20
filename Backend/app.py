from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
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
    return jsonify(employees)

# GET employee bu ID
@app.route("/api/employees/<int:id>", methods=["GET"])
def get_employee(id):
    employee = next((emp for emp in employees if emp["id"] == id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}),404
    return jsonify(employee)
    
#POST new employee
@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.get_json()
    new_id = max([emp["id"] for emp in employees], default=0) + 1 

    new_emp = {
        "id": new_id,
        "name" :data.get("name"),
        "email": data.get("email"),
        "position": data.get("position")
    }
    employees.append(new_emp)
    return jsonify(new_emp), 201

# PUT update employee
@app.route("/api/employees/<int:id>", methods=["PUT"])
def update_employee(id):
    data = request.get_json()
    employee = next((emp for emp in employees if emp["id"] == id), None)
    if not employee:
        return jsonify({"error":"The employee was not found"}), 404
    
    employee.update({
        "name": data.get("name", employee["name"]),
        "email": data.get("email", employee["email"]),
        "position": data.get("position", employee["position"])
    })
    return jsonify(employee)

# DELETE employee
@app.route("/api/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    employee = next((emp for emp in employees if emp["id"] == id), None)
    if not employee:
        return jsonify({"Error":"Employee not found for deletion"}), 404 
    
    employees.remove(employee)
    return jsonify({"message":"Employee named " + str(employee["name"]) + " with id " + str(employee["id"]) + " deleted successfully"})

if __name__ == "__main__":
    app.run(debug=True)