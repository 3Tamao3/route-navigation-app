import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
 
class RegisterDto {
  @IsNotEmpty()
  username!: string;
 
  @IsEmail()
  email!: string;
 
  @IsNotEmpty()
  password!: string;
}
 
class LoginDto {
  @IsEmail()
  email!: string;
 
  @IsNotEmpty()
  password!: string;
}
 
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
 
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto.username, dto.email, dto.password);
  }
 
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}