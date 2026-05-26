import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const { password, ...result } = user!;
    return result;
  }

  async updateProfile(
    userId: number,
    data: { username?: string; email?: string; currentPassword?: string; newPassword?: string },
  ) {
    const update: Record<string, any> = {};

    if (data.username) update.username = data.username;
    if (data.email) update.email = data.email;

    if (data.newPassword) {
      if (!data.currentPassword) throw new BadRequestException('Current password is required');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const valid = await bcrypt.compare(data.currentPassword, user!.password);
      if (!valid) throw new BadRequestException('Current password is incorrect');
      update.password = await bcrypt.hash(data.newPassword, 10);
    }

    if (Object.keys(update).length === 0) return this.getProfile(userId);

    try {
      const updated = await this.prisma.user.update({ where: { id: userId }, data: update });
      const { password, ...result } = updated;
      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.includes('email') ? 'Email' : 'Username';
        throw new ConflictException(`${field} is already in use`);
      }
      throw error;
    }
  }
}
