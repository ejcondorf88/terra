import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TerraJwtPayload } from '@terra/shared/types';
import { UsersService, CreateUserDto, UserResponseDto } from '../users/users.service';

export class LoginDto {
  email!: string;
  password!: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{
    user: UserResponseDto;
    access_token: string;
  }> {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.usersService.create(createUserDto);
    const payload: TerraJwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };
    const access_token = this.jwtService.sign(payload);

    return { user, access_token };
  }

  async login(loginDto: LoginDto): Promise<{
    user: UserResponseDto;
    access_token: string;
  }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };
    const access_token = this.jwtService.sign(payload);

    return { user: userWithoutPassword as UserResponseDto, access_token };
  }

  async validateUser(id: number, email: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user || user.email !== email) {
      throw new Error('Invalid user');
    }
    return user;
  }
}
