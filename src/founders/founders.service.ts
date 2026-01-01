import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFounderDto } from './dto/create-founder.dto';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateFounderDto } from './dto/update-founder.dto';

@Injectable()
export class FoundersService {
  constructor(private prisma: PrismaService) {}

  async create(startupId: string, dto: CreateFounderDto) {
    // Startup kontrolü
    const startup = await this.prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) throw new NotFoundException('Startup Bulunamadı.');

    // where:{ startupId } olmalı (startup'ın içindeki founderları arıyoruz)
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
      orderBy: { displayOrder: 'asc' }, // Dokümanda genelde artan sıra istenir
    });
  }

  async findOne(startupId: string, founderId: string) {
    const founder = await this.prisma.founder.findFirst({
      where: { id: founderId, startupId },
    });
    if (!founder) throw new NotFoundException('Founder Bulunamadı');
    return founder; // return eklemeyi unutma, yoksa data gelmez
  }

  async update(founderId: string, dto: UpdateFounderDto) {
    return this.prisma.founder.update({
      where: { id: founderId },
      data: dto,
    });
  }

  async remove(startupId: string, founderId: string) {
    // startupId'ye göre saymalısın
    const count = await this.prisma.founder.count({ where: { startupId } });
    if (count <= 1) {
      throw new BadRequestException('Son Founder Silinemez. Her Startup En Az 1 Founder İçermelidir.');
    }

    await this.prisma.founder.delete({ where: { id: founderId } });
    return { success: true, message: 'Founder Başarıyla Silindi.' };
  }

  async reorder(startupId: string, founderIds: string[]) {
    // where koşulunda startupId ve founderId kontrol edilmeli
    return await this.prisma.$transaction(
      founderIds.map((id, index) =>
        this.prisma.founder.update({
          where: { id: id, startupId: startupId }, // Sadece o startup'ın founder'ını güncelle
          data: { displayOrder: index },
        }),
      ),
    );
  }
}