import axios from "axios";
import { getToken } from "../auth/auth";

const API = "http://localhost:8080/api/notifications";

const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`
});

export const getMyNotifications = async () => {
    const res = await axios.get(API, { headers: getHeaders() });
    return res.data;
};

export const markAsRead = async (id) => {
    const res = await axios.put(`${API}/${id}/read`, {}, { headers: getHeaders() });
    return res.data;
};
