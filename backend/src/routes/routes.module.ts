import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET ?? 'changeme' }),
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
