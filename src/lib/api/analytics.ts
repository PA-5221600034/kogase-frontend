import apiClient from "./client";
import { GetAnalyticsRequestQuery, GetAnalyticsResponse } from "../dtos/analytics_dto";

export const analyticsApi = {
  getAnalytics: async (query?: GetAnalyticsRequestQuery): Promise<GetAnalyticsResponse> => {
    const response = await apiClient.get<GetAnalyticsResponse>('/analytics', { params: query });
    return response.data;
  },
};

