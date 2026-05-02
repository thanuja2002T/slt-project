import axios from "axios";

const BASE_URL = "http://localhost:5000/api/fault";

// 🔥 CREATE
export const createSession = (data) => {
  return axios.post(`${BASE_URL}/create`, data);
};

// 🔥 GET
export const getSessions = () => {
  return axios.get(BASE_URL);
};

// 🔥 FINISH
export const finishSession = (id, data) => {
  return axios.put(`${BASE_URL}/finish/${id}`, data);
};