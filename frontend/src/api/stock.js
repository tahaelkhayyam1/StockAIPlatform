import axios from "axios";

const API = "http://localhost:8080/api";

export const getStockOverview = async () => {
  const res = await api.get("/api/stock/overview");
  return res.data;
};

export const addStock = (pieceId, qty, token) =>
  axios.post(`${API}/stock/entry?pieceId=${pieceId}&quantity=${qty}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const removeStock = (pieceId, qty, token) =>
  axios.post(`${API}/stock/exit?pieceId=${pieceId}&quantity=${qty}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const getStatus = (pieceId) =>
  api.get(`/stock/status/${pieceId}`);

