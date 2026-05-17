import api from "./axios";

export const getStockOverview = async () => {
  const res = await api.get("/api/stock/overview");
  return res.data;
};