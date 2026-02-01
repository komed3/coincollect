import axios from 'axios';

export const BASE_URL = `http://${window.location.hostname}:3001`;
const API_URL = `${BASE_URL}/api`;

export const APIService = axios.create( {
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
} );

export default APIService;
