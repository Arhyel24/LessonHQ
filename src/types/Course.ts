// This file defines the types and interfaces for course-related data structures.
//  * @param {string} id - The unique identifier for the course
//  * @param {string} slug - The URL-friendly identifier for the course

// This is only for API responses and internal data handling.
export interface ICourseTransformed {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  icon: string;
  progress: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  badge?: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  modules: string[];
  instructor: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  students: number;
  lessons?: ILesson[];
  requiresCompletionForDownload?: boolean;
  createdAt?: Date | string;
  lessonsCompleted?: string[]; // could be lesson IDs
  completedAt?: Date | string;
  certificateIssued?: boolean;
}

export interface ILesson {
  title: string;
  videoUrl: string;
  textContent?: string;
  duration?: number;
  order?: number;
}
