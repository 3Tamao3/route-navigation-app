import { Controller, Get, Req, UseGuards } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get('profile')
  getProfile(@Req() req: any) {
    // placeholder - replace with auth guard and actual user retrieval
    return { message: 'profile endpoint' };
  }
}