import axios from "axios";

const API = "http://localhost:8080/api";

export const login = async (email, password, deviceId) => {
  const res = await axios.post(`${API}/auth/login`, {
    email,
    password,
    deviceId
  });
  return res.data;
};

export const verify2FA = async (email, code) => {
  const res = await axios.post(`${API}/auth/verify-2fa`, {
    email,
    code,
  });
  return res.data;
};