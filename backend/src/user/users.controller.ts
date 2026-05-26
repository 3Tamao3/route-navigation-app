import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UserService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.sub);
  }

  @Patch('profile')
  updateProfile(
    @Body() body: { username?: string; email?: string; currentPassword?: string; newPassword?: string },
    @Req() req: any,
  ) {
    return this.userService.updateProfile(req.user.sub, body);
  }
}
