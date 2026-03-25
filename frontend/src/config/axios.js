// Configure axios with base URL
import axios from 'axios';

const resolveApiBase = () => {
	const explicit = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
	if (explicit) return explicit;

	if (typeof window !== 'undefined') {
		const host = window.location.hostname;
		if (host === 'www.tixe.dev' || host === 'tixe.dev') {
			return 'https://api.tixe.dev';
		}
	}

	return '';
};

const API_BASE_URL = resolveApiBase();

// Set default baseURL for all axios requests
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export default axios;
