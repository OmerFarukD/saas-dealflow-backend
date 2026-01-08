import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateFounderDto } from './dto/create-founder.dto';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class FoundersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Yardımcı Metod: Sahiplik ve Yetki Kontrolü
   */
  private async validateAccess(
    startupId: string,
    userId: string,
    role: UserRole,
  ) {
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) throw new NotFoundException('Startup Bulunamadı.');

    // Hata mesajına göre senin modelinde alan adı ownerId değil userId:
    if (role === UserRole.STARTUP && startup.userId !== userId) {
      throw new ForbiddenException(
        'Bu startup üzerinde işlem yapma yetkiniz yok.',
      );
    }
  }

  async create(
    startupId: string,
    userId: string,
    role: UserRole,
    dto: CreateFounderDto,
  ) {
    await this.validateAccess(startupId, userId, role);

    if (dto.email) {
      const existing = await this.prisma.founder.findFirst({
        where: { startupId, email: dto.email },
      });
      if (existing)
        throw new ConflictException('Bu email ile bir founder zaten mevcut.');
    }

    const last = await this.prisma.founder.findFirst({
      where: { startupId },
      orderBy: { displayOrder: 'desc' },
    });

    return this.prisma.founder.create({
      data: {
        ...dto,
        startupId,
        displayOrder: last ? last.displayOrder + 1 : 0,
      },
    });
  }

  async findAll(startupId: string, userId: string, role: UserRole) {
    // ESLint hatası gitmesi için: Eğer ek bir kontrol yapmayacaksak bile
    // validateAccess çağırarak hem startup var mı bakmış oluruz hem değişkenleri kullanırız.
    await this.validateAccess(startupId, userId, role);

    return this.prisma.founder.findMany({
      where: { startupId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(
    startupId: string,
    founderId: string,
    userId: string,
    role: UserRole,
  ) {
    // Burada da startup varlığını ve yetkiyi kontrol ederek ESLint'i susturuyoruz
    await this.validateAccess(startupId, userId, role);

    const founder = await this.prisma.founder.findFirst({
      where: { id: founderId, startupId },
    });
    if (!founder) throw new NotFoundException('Founder Bulunamadı');

    return founder;
  }

  async update(
    startupId: string,
    founderId: string,
    userId: string,
    role: UserRole,
    dto: UpdateFounderDto,
  ) {
    await this.validateAccess(startupId, userId, role);

    // founderId kontrolü
    const founder = await this.prisma.founder.findFirst({
      where: { id: founderId, startupId },
    });
    if (!founder)
      throw new NotFoundException(
        'Founder bulunamadı veya bu startup ile ilişkili değil.',
      );

    return this.prisma.founder.update({ where: { id: founderId }, data: dto });
  }

  async remove(
    startupId: string,
    founderId: string,
    userId: string,
    role: UserRole,
  ) {
    await this.validateAccess(startupId, userId, role);

    const count = await this.prisma.founder.count({ where: { startupId } });
    if (count <= 1) throw new BadRequestException('Son founder silinemez.');

    await this.prisma.founder.delete({ where: { id: founderId } });
    return { success: true, message: 'Founder başarıyla silindi.' };
  }

  async reorder(
    startupId: string,
    userId: string,
    role: UserRole,
    founderIds: string[],
  ) {
    await this.validateAccess(startupId, userId, role);

    const currentFounders = await this.prisma.founder.findMany({
      where: { startupId },
    });
    if (currentFounders.length !== founderIds.length) {
      throw new BadRequestException('ID listesi eksik veya fazla.');
    }

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
