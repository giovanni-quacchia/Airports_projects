export type UserRole = 'passenger' | 'airline' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  passwordHash: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}
