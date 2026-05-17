import api from "./axios";

export async function getKpis() {
  try {
    const res = await api.get("/api/dashboard/kpis");
    return res.data;
  } catch (error) {

    if (error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    throw error;
  }
}
export const getAdvancedKpis = async () => {
  const res = await api.get("/api/dashboard/advanced-kpis");
  return res.data;
};