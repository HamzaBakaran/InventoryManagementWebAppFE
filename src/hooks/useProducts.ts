import { useQuery } from "@tanstack/react-query";
import { getProductsByUserId } from "../api/products";
import { Product } from "../types";

export const useProducts = (userId: number, filters = {}) => {
  return useQuery<Product[], Error>({
    queryKey: ["products", userId, filters],
    queryFn: () => getProductsByUserId(userId, filters),
    enabled: !!userId, // Avoid running the query if userId is invalid
  });
};
