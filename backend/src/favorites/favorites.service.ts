import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  getFavorites(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  addFavorite(userId: number, destination: string) {
    return this.prisma.favorite.create({
      data: { userId, destination },
    });
  }

  removeFavorite(userId: number, id: number) {
    return this.prisma.favorite.deleteMany({
      where: { id, userId },
    });
  }
}
