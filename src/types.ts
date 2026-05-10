export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  points?: number;
  medalsCount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  exercise: string;
  videoId?: string;
}

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  createdAt: any; // Timestamp
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author: string;
  rating: number;
  students: number;
  difficulty: string;
  lessons: Lesson[];
  date?: string;
}
