import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFounderDto } from './dto/create-founder.dto';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateFounderDto } from './dto/update-founder.dto';

@Injectable()
export class FoundersService {
  constructor(private prisma: PrismaService) {}

  async create(startupId: string, dto: CreateFounderDto) {
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) {
      throw new NotFoundException('Startup Bulunamadı.');
    }

    const lastFounder = await this.prisma.founder.findFirst({
      where: { startupId },
      orderBy: { displayOrder: 'desc' },
    });

    const nextOrder = lastFounder ? lastFounder.displayOrder + 1 : 0;

    return this.prisma.founder.create({
      data: {
        ...dto,
        startupId,
        displayOrder: nextOrder,
      },
    });
  }

  async findAll(startupId: string) {
    return this.prisma.founder.findMany({
      where: { startupId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(startupId: string, founderId: string) {
    const founder = await this.prisma.founder.findFirst({
      where: { id: founderId, startupId },
    });

    if (!founder) {
      throw new NotFoundException('Founder Bulunamadı');
    }

    return founder;
  }

  async update(founderId: string, dto: UpdateFounderDto) {
    return this.prisma.founder.update({
      where: { id: founderId },
      data: dto,
    });
  }

  async remove(startupId: string, founderId: string) {
    const count = await this.prisma.founder.count({ where: { startupId } });

    if (count <= 1) {
      throw new BadRequestException(
        'Son Founder Silinemez. Her Startup En Az 1 Founder İçermelidir.',
      );
    }

    await this.prisma.founder.delete({ where: { id: founderId } });
    return { success: true, message: 'Founder Başarıyla Silindi.' };
  }

  async reorder(startupId: string, founderIds: string[]) {
    return this.prisma.$transaction(
      founderIds.map((id, index) =>
        this.prisma.founder.update({
          where: { id, startupId },
          data: { displayOrder: index },
        }),
      ),
    );
  }
}
