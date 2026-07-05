import api from "../services/api";

export const login = async (email, password) => {
  const response = await api.post("/login", {
    email,
    password,
  });
  return response.data;
};
export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
