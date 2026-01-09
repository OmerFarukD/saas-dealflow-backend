import { PrismaService } from '../database/prisma/prisma.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class MarketService {
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

    // İş Kuralı: STARTUP sadece kendi startup'ını yönetebilir
    if (role === UserRole.STARTUP && startup.userId !== userId) {
      throw new ForbiddenException(
        'Bu startup üzerinde işlem yapma yetkiniz yok.',
      );
    }
  }

  async findOne(startupId: string, userId: string, role: UserRole) {
    await this.validateAccess(startupId, userId, role);

    const market = await this.prisma.market.findUnique({
      where: { startupId },
    });
    if (!market) {
      throw new NotFoundException(
        'Bu startup için henüz market analizi girilmemiş.',
      );
    }
    return market;
  }

  async create(
    startupId: string,
    userId: string,
    role: UserRole,
    dto: CreateMarketDto,
  ) {
    // Yetki Kontrolü yapıyorum.
    await this.validateAccess(startupId, userId, role);

    // 2. Kontrol logu
    const existing = await this.prisma.market.findUnique({
      where: { startupId },
    });
    if (existing) {
      throw new ConflictException('Bu startup için kayıt zaten var.');
    }

    try {
      // 3. DTO'yu sadeleştir ve startupId'yi açıkça ekle
      const plainDto = instanceToPlain(dto);

      console.log('Veritabanına yazılmaya çalışılan data:', {
        ...plainDto,
        startupId,
      });

      const newMarket = await this.prisma.market.create({
        data: {
          ...plainDto,
          startupId: startupId,
        },
      });

      console.log('Kayıt Başarılı:', newMarket);
      return newMarket;
    } catch (error: unknown) {
      console.error('PRISMA CREATE HATASI:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Veritabanı seviyesinde çakışma: Kayıt zaten mevcut.',
          );
        }
      }
      throw new InternalServerErrorException(
        'Kayıt sırasında beklenmedik bir hata oluştu.',
      );
    }
  }

  async update(
    startupId: string,
    userId: string,
    role: UserRole,
    dto: UpdateMarketDto,
  ) {
    await this.validateAccess(startupId, userId, role);

    // Kayıt olup olmadığını kontrol ediyorum.
    const market = await this.prisma.market.findUnique({
      where: { startupId },
    });
    if (!market) throw new NotFoundException('Market kaydı bulunamadı.');

    // DTO'yu düz bir objeye çeviriyoruz ve ESLint için tipini belirtiyoruz
    const plainDto = instanceToPlain(dto) as Record<string, unknown>;

    return this.prisma.market.update({
      where: { startupId },
      data: plainDto,
    });
  }

  async remove(startupId: string, userId: string, role: UserRole) {
    await this.validateAccess(startupId, userId, role);

    // İş Kuralı
    try {
      await this.prisma.market.delete({ where: { startupId } });
      return { success: true, message: 'Market bilgileri başarıyla silindi.' };
    } catch {
      throw new NotFoundException('Market kaydı bulunamadı.');
    }
  }
}
