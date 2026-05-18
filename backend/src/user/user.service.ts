import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
    private users: User[] = []; // Example user array, replace with your DB logic

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find(user => user.email === email);
    }

async createUser(username: string, password: string, email: string): Promise<User> {
    const newUser = new User();
    newUser.username = username;
    newUser.password = password; // Store the hashed password
    newUser.email = email;
    this.users.push(newUser); // Replace with your DB logic
    return newUser;
}

    // Add other user-related methods as needed
}