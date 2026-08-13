export interface User {
  id: number;
  email: string;
  password: string;
  nombre: string;
  rol: 'productor' | 'inversionista' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'password'> {
  lotesCount?: number;
  nftsCount?: number;
}
