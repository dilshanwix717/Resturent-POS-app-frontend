import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://sepasmocktailbackend.onrender.com/api/",
  //baseURL: "http://localhost:8081/api/",

  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
