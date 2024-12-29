import apiClient from "./index";
import { Product } from "../types";

export const getProductsByUserId = async (userId: number): Promise<Product[]> => {
  const response = await apiClient.get(`/api/products/user/${userId}`);
  return response.data;
};
