import React, { useEffect, useState } from "react";
import { getEmployees, deleteEmployee, updateEmployee } from "../services/api";
import EmployeeForm from "./EmployeeForm";

const EmployeeTable = ({ refreshFlag }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);


  useEffect(() => {
    const fetchEmployees = async () => {
      const params = {};
      if (search) params.search = search;
      if (activeFilter) params.active = activeFilter;

      const response = await getEmployees(params);
      setEmployees(response.data);
      
    };

    fetchEmployees();
  }, [search, activeFilter, refreshFlag]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      await deleteEmployee(id);  // trigger refresh

      const response = await getEmployees({});
      setEmployees(response.data);
    }
  };

    const refreshEmployees = async () => {
        const response = await getEmployees({});
        setEmployees(response.data);
    };

    const closeModal = () => {
      setShowModal(false);
      setSelectedEmployee(null);
    };

  return (
    <div>
      <input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <button
          onClick={() => {
            setSelectedEmployee(null); // ADD mode
            setShowModal(true);
          }}
        >
          Add Employee
        </button>
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.first_name} {e.last_name}</td>
              <td>{e.email}</td>
              <td>{e.date_of_birth}</td>
              <td>{e.is_active ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => {setSelectedEmployee(e); setShowModal(true);}}>Edit</button>
                <button onClick={() => handleDelete(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{selectedEmployee ? "Edit Employee" : "Add Employee"}</h3>
              <button onClick={closeModal}>✕</button>
            </div>

            <EmployeeForm
              employee={selectedEmployee}
              onSuccess={() => {
                closeModal();
                refreshEmployees();
              }}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  width: "500px",
  borderRadius: "8px",
};

export default EmployeeTable;
