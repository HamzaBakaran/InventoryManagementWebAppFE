import apiClient from "./index";
import { Product } from "../types";

export const getProductsByUserId = async (
  userId: number,
  filters: { name?: string; description?: string; quantity?: number; categoryId?: number; sortBy?: string; order?: string } = {}
): Promise<Product[]> => {
  const params = new URLSearchParams();

  // Add userId
  params.append("userId", String(userId));

  // Add filters
  if (filters.name) params.append("name", filters.name);
  if (filters.description) params.append("description", filters.description);
  if (filters.quantity !== undefined) params.append("quantity", String(filters.quantity));
  if (filters.categoryId !== undefined) params.append("categoryId", String(filters.categoryId));

  // Add sorting
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.order) params.append("order", filters.order);

  const response = await apiClient.get(`/api/products/user/${userId}?${params.toString()}`);
  return response.data;
};
