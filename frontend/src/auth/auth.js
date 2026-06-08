export const saveAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("email", data.email);
  localStorage.setItem("userId", data.userId);
};
 
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