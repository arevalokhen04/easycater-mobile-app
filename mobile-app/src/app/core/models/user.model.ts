export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
