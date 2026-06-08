import axios from "axios";

const API = "http://localhost:8080/api";

export const getPieces = (token) =>
  axios.get(`${API}/pieces`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const createPiece = (data, token) =>
  axios.post(`${API}/pieces`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });