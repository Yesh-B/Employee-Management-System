import React, { useEffect, useState } from "react";
import { getEmployees, deleteEmployee, updateEmployee } from "../services/api";
import EmployeeForm from "./EmployeeForm";

const EmployeeTable = ({ refreshFlag }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
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

  const handleEdit = async (employee) => {
    try {
        await updateEmployee(employee.id, {
        is_active: !employee.is_active
        });

        // Update UI without refetching
        setEmployees(prev =>
        prev.map(e =>
            e.id === employee.id
            ? { ...e, is_active: !e.is_active }
            : e
        )
        );
    } catch (error) {
        alert("Failed to update employee");
        }
    };

    const refreshEmployees = async () => {
        const response = await getEmployees({});
        setEmployees(response.data);
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

      {selectedEmployee && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
            <h3>Edit Employee</h3>
            <EmployeeForm
            employee={selectedEmployee}
            onSuccess={() => {
                setSelectedEmployee(null); // close form after save
                refreshEmployees();        // re-fetch the table
            }}
            onCancel={() => setSelectedEmployee(null)} // close form on cancel
            />
        </div>
      )}


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
                <button onClick={() => handleDelete(e.id)}>Delete</button>
                <button onClick={() => setSelectedEmployee(e)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
