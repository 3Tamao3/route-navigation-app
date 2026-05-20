import axios from 'axios';

const BASE_URL = 'http://192.168.0.249:3000';

export const api = axios.create({ baseURL: BASE_URL });

export const authApi = (token: string) =>
  axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
