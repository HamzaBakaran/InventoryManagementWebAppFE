import { useQuery } from "@tanstack/react-query";
import { getProductsByUserId } from "../api/products";
import { Product } from "../types";

export const useProducts = (userId: number) => {
  return useQuery<Product[], Error>({
    queryKey: ["products", userId],
    queryFn: () => getProductsByUserId(userId),
    enabled: !!userId, // Avoid running the query if userId is invalid
  });
};
