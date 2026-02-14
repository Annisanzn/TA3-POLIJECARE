import api from "../api/axios";

export const getTest = async () => {
  const response = await api.get("/test");
  return response.data;
};
