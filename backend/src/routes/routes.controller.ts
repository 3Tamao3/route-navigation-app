import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RoutesService } from './routes.service';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  saveRoute(
    @Body() body: { destination: string; distance: number; duration: number },
    @Req() req: any,
  ) {
    return this.routesService.saveRoute(req.user.sub, body.destination, body.distance, body.duration);
  }

  @Get('history')
  getHistory(@Req() req: any) {
    return this.routesService.getHistory(req.user.sub);
  }
}
