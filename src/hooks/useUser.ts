import { useQuery } from "@tanstack/react-query";
import { getUserByEmail } from "../api/users";
import { User } from "../types";

export const useUser = (email: string) => {
  return useQuery<User, Error>({
    queryKey: ["user", email],
    queryFn: () => getUserByEmail(email),
    enabled: !!email, // Avoid running the query if email is empty
  });
};
