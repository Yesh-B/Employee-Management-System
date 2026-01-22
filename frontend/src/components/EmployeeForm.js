import React, { useState, useEffect } from "react";
import { addEmployee, updateEmployee } from "../services/api";

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
    // State for form fields
    const [form, setForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        email: "",
        is_active: true,
    });

    // Populate form when editing an existing employee
    useEffect(() => {   // populates form with data of selected employee
        setForm({
            first_name: employee?.first_name || "", // either has data or empty
            middle_name: employee?.middle_name || "",
            last_name: employee?.last_name || "",
            date_of_birth: employee?.date_of_birth || "",
            email: employee?.email || "",
            is_active: employee?.is_active ?? true,
        });
    }, [employee]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Handle form submission (Add or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();    // prevents page reload, essential for rract forms to work

        try {
            if (employee) {
                await updateEmployee(employee.id, form);  // if exists, edit
            } else {
                await addEmployee(form);  // if not, add
                
                // Reset form after successful add
                setForm({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    date_of_birth: "",
                    email: "",
                    is_active: true,
                });
            } 
            onSuccess(); // trigger table refresh

        } catch (err) {
          // Axios throws an error for non-2xx responses
            if (err.response && err.response.data && err.response.data.error) {
                // Show the backend error (like duplicate email)
                alert(err.response.data.error);
            } else {
                // Generic fallback
                alert("An unexpected error occurred");
                console.error(err);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
            <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
            <input type="text" name="middle_name" placeholder="Middle Name" value={form.middle_name} onChange={handleChange} />
            <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
            </div>
            <div>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required />
            </div>
            <div>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <label>
                Active
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            </label>
            </div>
            <button type="submit">{employee ? "Update Employee" : "Add Employee"}</button>
            <button type="button" onClick={onCancel}>Close</button>
        </form>
    );
};

export default EmployeeForm;