import apiClient from "./index";
import { Category } from "../types";

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get(`/categories`);
  return response.data;
};
