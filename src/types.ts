export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
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
  date?: string;
}
