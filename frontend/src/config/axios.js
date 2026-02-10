// Configure axios with base URL
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Set default baseURL for all axios requests
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;
