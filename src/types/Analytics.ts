// For API data used in the admin dashboard analytics

export type UserGrowth = {
  month: string;
  users: number;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type CoursePopularity = {
  name: string;
  enrollments: number;
  completions: number;
  price: number;
};

export type CompletionRate = {
  name: "Completed" | "In Progress" | "Not Started";
  value: number;
  color: string;
};

export type AnalyticsResponse = {
  success: boolean;
  data: {
    userGrowthData: UserGrowth[];
    revenueData: Revenue[];
    coursePopularityData: CoursePopularity[];
    completionRateData: CompletionRate[];
  };
};
  