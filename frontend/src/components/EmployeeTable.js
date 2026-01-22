import React, { useEffect, useState } from "react";
import { getEmployees, deleteEmployee } from "../services/api";
import EmployeeForm from "./EmployeeForm";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

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
      await deleteEmployee(id);
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
      <Stack
        direction="row"
        spacing={2}
        mb={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left side: Search + Filter */}
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FormControl variant="outlined" size="medium" sx={{ minWidth: 150 }}>
            <InputLabel id="active-filter-label">Filter by</InputLabel>
            <Select
              labelId="active-filter-label"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              label="Filter by"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Right side: Add Employee button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedEmployee(null);
            setShowModal(true);
          }}
        >
          Add Employee
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell>
                  {e.first_name} {e.middle_name}. {e.last_name}
                </TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>{e.date_of_birth}</TableCell>
                <TableCell>
                  <Chip
                    label={e.is_active ? "Active" : "Inactive"}
                    color={e.is_active ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelectedEmployee(e);
                      setShowModal(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(e.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showModal} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogContent>
          <EmployeeForm
            employee={selectedEmployee}
            onSuccess={() => {
              closeModal();
              refreshEmployees();
            }}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeTable;
