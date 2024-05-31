import axios from "axios";

export const cherryAxios = axios.create({
  baseURL: "http://localhost:5500/api/v1/",
});
