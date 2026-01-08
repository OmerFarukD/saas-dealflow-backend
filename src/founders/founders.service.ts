import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
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

    // 1. İş Kuralı: Aynı startup'ta email çakışması kontrolü
    if (dto.email) {
      const existingEmail = await this.prisma.founder.findFirst({
        where: { startupId, email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(
          'Bu email adresi ile kayıtlı bir founder zaten mevcut.',
        );
      }
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

  async update(startupId: string, founderId: string, dto: UpdateFounderDto) {
    // Güvenlik: Güncellenecek founder'ın o startup'a ait olduğunu doğrula
    const founder = await this.findOne(startupId, founderId);

    return this.prisma.founder.update({
      where: { id: founder.id },
      data: dto,
    });
  }

  async remove(startupId: string, founderId: string) {
    // Önce bu founder gerçekten bu startup'ın mı kontrol et (Güvenlik)
    await this.findOne(startupId, founderId);

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
    // 2. İş Kuralı: Eksik/Fazla ID kontrolü
    const currentFounders = await this.prisma.founder.findMany({
      where: { startupId },
      select: { id: true },
    });

    if (currentFounders.length !== founderIds.length) {
      throw new BadRequestException(
        'Eksik veya fazla founder ID listesi gönderildi.',
      );
    }

    // Gönderilen ID'lerin gerçekten bu startup'a ait olduğunu doğrula
    const currentIds = currentFounders.map((f) => f.id);
    const allIdsValid = founderIds.every((id) => currentIds.includes(id));

    if (!allIdsValid) {
      throw new BadRequestException(
        'Gönderilen ID lerden bazıları bu startup a ait değil.',
      );
    }

    // Transaction: Hepsi başarılı olmalı ya da hiçbiri
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
