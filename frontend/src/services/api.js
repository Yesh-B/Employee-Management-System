import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getEmployees = (params = {}) => axios.get(`${API_BASE_URL}/employees`, { params });

export const getEmployeebyId = (id) => axios.get(`${API_BASE_URL}/employees/${id}`);

export const addEmployee = (employeeData) => axios.post(`${API_BASE_URL}/employees`, employeeData);

export const updateEmployee = (id, employeeData) => axios.put(`${API_BASE_URL}/employees/${id}`, employeeData);

export const deleteEmployee = (id) => axios.delete(`${API_BASE_URL}/employees/${id}`);