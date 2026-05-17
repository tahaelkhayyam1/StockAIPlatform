import api from "./axios";

export const getReorderRecommendations = async () => {
  const res = await api.get("/api/recommendations/reorder");
  return res.data;
};