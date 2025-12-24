import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class StartupsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateStartupDto) {
    const existingStartup = await this.prisma.startup.findUnique({
      where: { userId },
    });

    if (existingStartup) {
      throw new ConflictException('Kullanıcının Zaten bir Startup ı mevcut.');
    }

    const startup = await this.prisma.startup.create({
      data: {
        userId,
        companyName: dto.companyName,
        tagline: dto.tagline,
        stage: dto.stage,
        category: dto.category,
        website: dto.website,
        location: dto.location,
        founders: {
          create: dto.founders.map((founder, index) => ({
            ...founder,
            displayOrder: index,
          })),
        },
      },
      include: {
        founders: true,
      },
    });

    return startup;
  }

  async findAll(userId: string, userRole: UserRole) {
    if (userRole === 'STARTUP') {
      throw new ForbiddenException(
        'Startup rolündekiler başka startupları görüntüleyemez.',
      );
    }

    const startups = await this.prisma.startup.findMany({
      where: {
        status: 'ACTIVE',
        isPublished: true,
      },
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return startups;
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup Bulunamadı');
    }

    if (userRole === 'STARTUP' && startup.userId !== userId) {
      throw new ForbiddenException(
        'Sadece kendi Startup görüntüleyebilirsiniz.',
      );
    }

    return startup;
  }

  async findMyStartup(userId: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId },
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Henüz bir Startup bilgisi mevcut değil.');
    }

    return startup;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateStartupDto,
  ) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },
    });

    if (!startup) {
      throw new NotFoundException('Startup bulunamadı.');
    }

    if (userRole !== 'ADMIN' && startup.userId !== userId) {
      throw new ForbiddenException(
        'Sadece kendi startup bilgilerinizi güncelleyebilirsiniz.',
      );
    }

    const updated = await this.prisma.startup.update({
      where: { id },
      data: dto,
      include: {
        founders: true,
      },
    });

    return updated;
  }
}
