import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { addEmployee, updateEmployee } from "../services/api";

/**
 * EmployeeForm
 * - Validates client-side before submitting
 * - Shows field errors + server errors
 * - Shows loading state on submit
 * - Asks for confirmation on close if form is dirty
 *
 * Props:
 * - employee: object | null
 * - onSuccess: fn called after successful submit
 * - onCancel: fn called to close/cancel the form
 */
const todayISO = () => new Date().toISOString().slice(0, 10);

const validateEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const emptyForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  date_of_birth: "",
  email: "",
  is_active: true,
};

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Initialize form when employee changes
  useEffect(() => {
    setFieldErrors({});
    setServerError("");
    setForm({
      first_name: employee?.first_name || "",
      middle_name: employee?.middle_name || "",
      last_name: employee?.last_name || "",
      date_of_birth: employee?.date_of_birth || "",
      email: employee?.email || "",
      is_active: employee?.is_active ?? true,
    });
  }, [employee]);

  const isDirty = useMemo(() => {
    // simple dirty check vs emptyForm or initial employee
    const base = {
      first_name: employee?.first_name || "",
      middle_name: employee?.middle_name || "",
      last_name: employee?.last_name || "",
      date_of_birth: employee?.date_of_birth || "",
      email: employee?.email || "",
      is_active: employee?.is_active ?? true,
    };
    return JSON.stringify(base) !== JSON.stringify(form);
  }, [employee, form]);

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = "First name is required";
    if (!form.last_name.trim()) errs.last_name = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";
    if (!form.date_of_birth) errs.date_of_birth = "Date of birth is required";
    else if (form.date_of_birth > todayISO()) errs.date_of_birth = "Date cannot be in the future";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    // live-validate small fields to give quick feedback
    if (fieldErrors.email && validateEmail(form.email)) {
      setFieldErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
  }, [form.email]); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setServerError("");
    if (!validate()) {
      setSnackbar({ open: true, message: "Fix validation errors", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      if (employee) {
        await updateEmployee(employee.id, form);
        setSnackbar({ open: true, message: "Employee updated", severity: "success" });
      } else {
        await addEmployee(form);
        setSnackbar({ open: true, message: "Employee added", severity: "success" });
        setForm(emptyForm);
      }
      setFieldErrors({});
      onSuccess?.();
    } catch (err) {
      // Map server validation errors if present
      const srv = err?.response?.data;
      if (srv?.errors && typeof srv.errors === "object") {
        // assume format { fieldName: ["msg1", "msg2"] } or {fieldName: "msg"}
        const mapped = {};
        Object.entries(srv.errors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setFieldErrors(mapped);
        setServerError("Please fix highlighted fields.");
        setSnackbar({ open: true, message: "Validation errors from server", severity: "error" });
      } else if (srv?.error) {
        setServerError(String(srv.error));
        setSnackbar({ open: true, message: srv.error, severity: "error" });
      } else {
        const msg = err.message || "Unexpected error";
        setServerError(msg);
        setSnackbar({ open: true, message: "An unexpected error occurred", severity: "error" });
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onCancel?.();
  };

  const confirmClose = () => {
    setConfirmCloseOpen(false);
    onCancel?.();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Stack>
          <Typography variant="h6">{employee ? "Edit Employee" : "Add Employee"}</Typography>
          <Typography variant="caption" color="text.secondary">
            Fill the details and save. Fields marked with * are required.
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent dividers>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Name row */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First name *"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              error={Boolean(fieldErrors.first_name)}
              helperText={fieldErrors.first_name}
              fullWidth
              autoFocus
            />
            <TextField
              label="Middle name"
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
              error={Boolean(fieldErrors.middle_name)}
              helperText={fieldErrors.middle_name}
              fullWidth
            />
            <TextField
              label="Last name *"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              error={Boolean(fieldErrors.last_name)}
              helperText={fieldErrors.last_name}
              fullWidth
            />
          </Stack>

          {/* Email */}
          <TextField
            label="Email *"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            fullWidth
          />

          {/* DOB + Active */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              label="Date of birth *"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              error={Boolean(fieldErrors.date_of_birth)}
              helperText={fieldErrors.date_of_birth}
              sx={{ minWidth: 180 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.is_active)}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  name="is_active"
                  color="success"
                />
              }
              label={form.is_active ? "Active" : "Inactive"}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="secondary" variant="outlined" disabled={loading}>
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          disabled={loading}
        >
          {loading ? (employee ? "Updating..." : "Saving...") : employee ? "Update employee" : "Add employee"}
        </Button>
      </DialogActions>

      {/* Unsaved changes confirmation */}
      <Dialog open={confirmCloseOpen} onClose={() => setConfirmCloseOpen(false)}>
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>
          <Typography> You have unsaved changes. Are you sure you want to close without saving?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCloseOpen(false)}>Keep editing</Button>
          <Button color="error" onClick={confirmClose}>
            Discard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for toast messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
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

export default EmployeeForm;