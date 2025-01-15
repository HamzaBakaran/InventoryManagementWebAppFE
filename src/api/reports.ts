import apiClient from "./index";

export const getSalesSummary = async (): Promise<[number, string, number][]> => {
  const response = await apiClient.get("/api/reports/sales/summary");
  return response.data;
};
