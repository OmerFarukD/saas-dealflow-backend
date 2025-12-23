import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        lastLoginAt: true,
        investorPreferences: true,
        startup: {
          include: {
            founders: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.profilePhotoUrl !== undefined && {
          profilePhotoUrl: dto.profilePhotoUrl,
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePhotoUrl: true,
      },
    });
    return user;
  }

  async getUserById(userId: string, requestingUserId: string) {
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { role: true },
    });

    if (!requestingUser) {
      throw new NotFoundException('Kullanıcı Bulunamadı.');
    }

    if (requestingUser.role === 'STARTUP' && userId !== requestingUserId) {
      throw new BadRequestException(
        'Startup rolünde ki kişiler sadece kendi profilini görüntüleyebilir.',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        investorPreferences:
          requestingUser.role === 'INVESTOR' || requestingUser.role === 'ADMIN',
        startup: {
          include: {
            founders: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı Bulunamadı.');
    }
    return user;
  }
}
