export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  color: string;
  isOwner: boolean;
  author: User;
  categories: Category[];
  sharedWith: {
    user: User;
    permission: "view" | "edit";
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}