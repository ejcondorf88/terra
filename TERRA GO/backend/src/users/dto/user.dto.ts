export class CreateUserDto {
  email!: string;
  password!: string;
  nombre!: string;
  rol!: 'productor' | 'inversionista' | 'admin';
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class UserResponseDto {
  id!: number;
  email!: string;
  nombre!: string;
  rol!: string;
}
