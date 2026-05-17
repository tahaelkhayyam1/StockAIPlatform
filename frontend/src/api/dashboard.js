import api from "./axios";

export const getKpis = async () => {
  const res = await api.get("/api/dashboard/kpis");
  return res.data;
};

export const getAdvancedKpis = async () => {
  const res = await api.get("/api/dashboard/advanced-kpis");
  return res.data;
};