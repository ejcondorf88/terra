import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';

export class CreateUserDto {
  email!: string;
  password!: string;
  nombre!: string;
  rol!: 'productor' | 'inversionista' | 'admin';
}

export class UserResponseDto {
  id!: number;
  email!: string;
  nombre!: string;
  rol!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      nombre: createUserDto.nombre,
      rol: createUserDto.rol,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result as UserResponseDto;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<UserResponseDto | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return undefined;

    const { password, ...result } = user;
    return result as UserResponseDto;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...user }) => user as UserResponseDto);
  }
}
