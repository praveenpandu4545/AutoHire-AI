import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {

  const token = getToken();

  if (!token) return null;

  const decoded = jwtDecode(token);

  return {
    email: decoded.sub,
    role: decoded.role
  };
};