import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://sepasmocktailbackend.onrender.com/api/",
  //baseURL: "http://localhost:8081/api/",
  withCredentials: true,
});

export default newRequest;
