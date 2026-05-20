import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async saveRoute(userId: number, destination: string, distance: number, duration: number) {
    return this.prisma.route.create({
      data: { userId, origin: 'Current Location', destination, distance, duration },
    });
  }

  async getHistory(userId: number) {
    return this.prisma.route.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
