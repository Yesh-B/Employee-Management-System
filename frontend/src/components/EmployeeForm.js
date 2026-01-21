import React, { useState } from "react";
import { addEmployee } from "../services/api";

const EmployeeForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    email: "",
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addEmployee(form);
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      email: "",
      is_active: true,
    });
    onSuccess(); // trigger table refresh
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
        <input name="middle_name" placeholder="Middle Name" value={form.middle_name} onChange={handleChange} />
        <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
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
      <button type="submit">Add Employee</button>
    </form>
  );
};

export default EmployeeForm;