import apiClient from "./client";
import { 
  GetAnalyticsRequestQuery, 
  GetAnalyticsResponse 
} from "@/lib/dtos";

export const analyticsApi = {
  getAnalytics: async (getAnalyticsRequestQuery?: GetAnalyticsRequestQuery): Promise<GetAnalyticsResponse> => {
    const response = await apiClient.get<GetAnalyticsResponse>('/analytics', { params: getAnalyticsRequestQuery });
    return response.data;
  },
};

