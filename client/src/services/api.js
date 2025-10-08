import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitJob = (jobData) => api.post('/jobs', jobData);
export const getJobs = () => api.get('/jobs');
export const getJobById = (jobId) => api.get(`/jobs/${jobId}`);
export const getDevices = () => api.get('/devices');
export const getDeviceById = (deviceId) => api.get(`/devices/${deviceId}`);

export default api;