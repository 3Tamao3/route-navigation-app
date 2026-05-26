import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './users.service';
import { UserController } from './users.controller';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET ?? 'changeme' }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
