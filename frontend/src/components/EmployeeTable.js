import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { getEmployees, deleteEmployee } from "../services/api";
import EmployeeForm from "./EmployeeForm";

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
};

const initials = (first, middle, last) => {
  const parts = [first, middle, last].filter(Boolean);
  return parts.map((p) => p[0]?.toUpperCase()).join("").slice(0, 2);
};

const EmployeeTable = ({ refreshFlag }) => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Pagination (client-side)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Fetch employees on mount and when refreshFlag changes
  useEffect(() => {
    let mounted = true;
    const fetchEmployees = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const response = await getEmployees({});
        if (!mounted) return;
        // assume response.data is list
        setAllEmployees(response.data || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setFetchError("Unable to load employees.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEmployees();
    return () => {
      mounted = false;
    };
  }, [refreshFlag]);

  // Debounce search input for 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Filtering - client-side for snappy UI (switch to server-side easily)
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return allEmployees.filter((e) => {
      if (activeFilter === "true" && !e.is_active) return false;
      if (activeFilter === "false" && e.is_active) return false;

      if (!q) return true;
      const name = `${e.first_name || ""} ${e.middle_name || ""} ${e.last_name || ""}`.toLowerCase();
      const email = (e.email || "").toLowerCase();
      return name.includes(q) || email.includes(q) || String(e.id).includes(q);
    });
  }, [allEmployees, debouncedSearch, activeFilter]);

  // Ensure page in range when filtered list changes
  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filtered.length) {
      setPage(0);
    }
  }, [filtered, page, rowsPerPage]);

  const displayed = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleDeleteClick = (employee) => {
    setToDelete(employee);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteEmployee(toDelete.id);
      setSnackbar({ open: true, message: "Employee deleted", severity: "success" });
      // update local list
      setAllEmployees((prev) => prev.filter((p) => p.id !== toDelete.id));
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete employee", severity: "error" });
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const refreshEmployees = async () => {
    setLoading(true);
    try {
      const resp = await getEmployees({});
      setAllEmployees(resp.data || []);
      setSnackbar({ open: true, message: "Employees refreshed", severity: "info" });
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to refresh", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search by name, email or id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 320 }}
            InputProps={{
              endAdornment: loading ? <CircularProgress size={18} /> : null,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="active-filter-label">Status</InputLabel>
            <Select
              labelId="active-filter-label"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" size="small" onClick={() => { setSearch(""); setActiveFilter(""); }}>
            Clear
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedEmployee(null);
              setShowModal(true);
            }}
          >
            Add Employee
          </Button>

          <Button variant="outlined" onClick={refreshEmployees}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={2}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell sx={{ width: 120 }}>DOB</TableCell>
                <TableCell sx={{ width: 110 }}>Active</TableCell>
                <TableCell sx={{ width: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: rowsPerPage }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={6} sx={{ py: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography color="text.secondary">Loading employees…</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : fetchError ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box p={2}>
                      <Typography color="error">{fetchError}</Typography>
                      <Button onClick={refreshEmployees} sx={{ mt: 1 }}>Retry</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box p={4} textAlign="center">
                      <Typography variant="h6" color="text.secondary">No employees found</Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Try resetting filters or add a new employee.
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setSelectedEmployee(null);
                          setShowModal(true);
                        }}
                      >
                        Add Employee
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((e) => (
                  <TableRow
                    key={e.id}
                    hover
                    sx={{
                      "&:hover": { transform: "translateY(-1px)" },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {e.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 14 }}>
                          {initials(e.first_name, e.middle_name, e.last_name)}
                        </Avatar>
                        <Box>
                          <Typography>
                            {e.first_name} {e.middle_name ? `${e.middle_name}.` : ""} {e.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.title || ""}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{e.email}</Typography>
                    </TableCell>

                    <TableCell>{formatDate(e.date_of_birth)}</TableCell>

                    <TableCell>
                      <Chip
                        label={e.is_active ? "Active" : "Inactive"}
                        color={e.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedEmployee(e);
                              setShowModal(true);
                            }}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(e)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 8, 12, 20]}
        />
      </Paper>

      {/* Edit / Add Dialog */}
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

      {/* Confirm delete */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>
            {toDelete?.first_name} {toDelete?.last_name}
          </strong>
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeTable;