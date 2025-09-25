export type UserRole = 'passenger' | 'airline' | 'admin';

export interface User {
  id: string;
  mail: string;
  name?: string;
  role: UserRole;
  passwordHash: string;
}

export interface Credentials {
  mail: string;
  password: string;
}

export interface RegisterDto {
  mail: string;
  password: string;
  name?: string;
  role?: UserRole;
}

