import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://inventorymanagementwebapp.onrender.com/",
});

export default apiClient;
