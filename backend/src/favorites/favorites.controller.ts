import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@Req() req: any) {
    return this.favoritesService.getFavorites(req.user.sub);
  }

  @Post()
  addFavorite(@Body() body: { destination: string }, @Req() req: any) {
    return this.favoritesService.addFavorite(req.user.sub, body.destination);
  }

  @Delete(':id')
  removeFavorite(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.favoritesService.removeFavorite(req.user.sub, id);
  }
}
