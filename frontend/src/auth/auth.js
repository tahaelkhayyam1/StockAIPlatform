export const saveAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("email", data.email);
  if (data.userId) localStorage.setItem("userId", data.userId);
  if (data.id) localStorage.setItem("userId", data.id); // depending on backend
  if (data.profilePicture) localStorage.setItem("profilePicture", data.profilePicture);
  if (data.deviceId) localStorage.setItem("deviceId", data.deviceId);
};

export const getAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    role: localStorage.getItem("role"),
    email: localStorage.getItem("email"),
    id: localStorage.getItem("userId"),
    profilePicture: localStorage.getItem("profilePicture"),
    deviceId: localStorage.getItem("deviceId")
  };
};

export const getDeviceId = () =>
  localStorage.getItem("deviceId");
 
export const getRole = () =>
  localStorage.getItem("role");

export const getToken = () =>
  localStorage.getItem("token");

export const getEmail = () =>
  localStorage.getItem("email");

export const getUserId = () =>
  localStorage.getItem("userId");

export const logout = () => {
  localStorage.clear();
};