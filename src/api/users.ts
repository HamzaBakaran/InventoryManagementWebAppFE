import apiClient from "./index";
import { User } from "../types";

export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await apiClient.get(`/users/${email}`);
  return response.data;
};
