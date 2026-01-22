import React, { useState, useEffect } from "react";
import { addEmployee, updateEmployee } from "../services/api";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Stack,
} from "@mui/material";

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    email: "",
    is_active: true,
  });

  useEffect(() => {
    setForm({
      first_name: employee?.first_name || "",
      middle_name: employee?.middle_name || "",
      last_name: employee?.last_name || "",
      date_of_birth: employee?.date_of_birth || "",
      email: employee?.email || "",
      is_active: employee?.is_active ?? true,
    });
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (employee) {
        await updateEmployee(employee.id, form);
      } else {
        await addEmployee(form);
        setForm({
          first_name: "",
          middle_name: "",
          last_name: "",
          date_of_birth: "",
          email: "",
          is_active: true,
        });
      }
      onSuccess();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("An unexpected error occurred");
        console.error(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Middle Name"
            name="middle_name"
            value={form.middle_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            fullWidth
          />
        </Stack>

        <TextField
          label="Date of Birth"
          type="date"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.is_active}
              onChange={handleChange}
              name="is_active"
            />
          }
          label="Active"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" color="primary" type="submit">
            {employee ? "Update Employee" : "Add Employee"}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Close
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default EmployeeForm;