import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }

    async login(email: string, password: string): Promise<any> {
        const user = await this.validateUser(email, password);
        if (!user) {
            return { message: 'Invalid email or password' };
        }
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(username: string, password: string, email: string): Promise<any> {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.userService.createUser(username, hashedPassword, email); 
    }
}