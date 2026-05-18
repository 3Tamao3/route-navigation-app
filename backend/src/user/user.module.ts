import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity'; // Ensure this is correct

@Module({
    providers: [UserService],
    exports: [UserService], // Export if needed elsewhere
})
export class UserModule {}