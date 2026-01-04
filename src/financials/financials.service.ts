import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { UserRole, Prisma } from '@prisma/client';

type JsonValue = Prisma.InputJsonValue;

@Injectable()
export class FinancialsService {
  private readonly logger = new Logger(FinancialsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * DTO'yu Prisma JSON uyumlu değere dönüştürür
   */
  private toJson(value: unknown, fallback: JsonValue = {}): JsonValue {
    if (value === undefined || value === null) {
      return fallback;
    }
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  }

  /**
   * Startup'ı kontrol eder ve erişim yetkisini doğrular
   */
  private async validateStartupAccess(
    startupId: string,
    userId: string,
    userRole: UserRole,
    requireWriteAccess: boolean = false,
  ) {
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
      select: {
        id: true,
        userId: true,
        isPublished: true,
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup bulunamadı.');
    }

    // INVESTOR: Sadece read erişimi, sadece published startup'lar
    if (userRole === UserRole.INVESTOR) {
      if (requireWriteAccess) {
        throw new ForbiddenException(
          'Yatırımcılar financial bilgisi ekleme/güncelleme/silme işlemi yapamaz.',
        );
      }
      if (!startup.isPublished) {
        throw new ForbiddenException(
          'Bu startup henüz yayınlanmamış, görüntüleyemezsiniz.',
        );
      }
    }

    // STARTUP: Sadece kendi startup'ı
    if (userRole === UserRole.STARTUP && startup.userId !== userId) {
      throw new ForbiddenException(
        "Sadece kendi startup'ınızın financial bilgilerini yönetebilirsiniz.",
      );
    }

    return startup;
  }

  /**
   * Startup için financial kaydı oluşturur
   * Her startup için sadece 1 kayıt olabilir
   */
  async create(
    startupId: string,
    userId: string,
    userRole: UserRole,
    dto: CreateFinancialDto,
  ) {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // Zaten financial kaydı var mı kontrol et
    const existingFinancial = await this.prisma.financial.findFirst({
      where: { startupId },
    });

    if (existingFinancial) {
      throw new ConflictException(
        'Bu startup için zaten financial kaydı mevcut. Güncellemek için PATCH kullanın.',
      );
    }

    const financial = await this.prisma.financial.create({
      data: {
        startupId,
        totalFundingRaised: dto.totalFundingRaised ?? 0,
        previousRounds: this.toJson(dto.previousRounds, []),
        previousInvestors: this.toJson(dto.previousInvestors, []),
        fundingTarget: dto.fundingTarget,
        minimumRaise: dto.minimumRaise,
        offeredDilution: dto.offeredDilution,
        preMoneyValuation: dto.preMoneyValuation,
        postMoneyValuation: dto.postMoneyValuation,
        useOfFunds: this.toJson(dto.useOfFunds, {}),
        founderEquity: dto.founderEquity,
        employeePool: dto.employeePool,
        investorEquity: dto.investorEquity,
        projectedRevenue: this.toJson(dto.projectedRevenue, {}),
        projectedCustomers: this.toJson(dto.projectedCustomers, {}),
      },
    });

    this.logger.log(`Financial created for startup ${startupId}: ${financial.id}`);

    return financial;
  }

  /**
   * Startup'ın financial bilgilerini getirir
   */
  async findOne(startupId: string, userId: string, userRole: UserRole) {
    // Startup erişim kontrolü
    await this.validateStartupAccess(startupId, userId, userRole);

    const financial = await this.prisma.financial.findFirst({
      where: { startupId },
    });

    if (!financial) {
      throw new NotFoundException(
        'Bu startup için henüz financial bilgisi girilmemiş.',
      );
    }

    return financial;
  }

  /**
   * Financial bilgilerini günceller
   */
  async update(
    startupId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateFinancialDto,
  ) {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // Financial var mı kontrol et
    const existingFinancial = await this.prisma.financial.findFirst({
      where: { startupId },
    });

    if (!existingFinancial) {
      throw new NotFoundException(
        'Bu startup için henüz financial kaydı bulunmuyor.',
      );
    }

    // Build update data dynamically to handle JSON fields properly
    const updateData: Prisma.FinancialUpdateInput = {};

    if (dto.totalFundingRaised !== undefined) {
      updateData.totalFundingRaised = dto.totalFundingRaised;
    }
    if (dto.previousRounds !== undefined) {
      updateData.previousRounds = this.toJson(dto.previousRounds);
    }
    if (dto.previousInvestors !== undefined) {
      updateData.previousInvestors = this.toJson(dto.previousInvestors);
    }
    if (dto.fundingTarget !== undefined) {
      updateData.fundingTarget = dto.fundingTarget;
    }
    if (dto.minimumRaise !== undefined) {
      updateData.minimumRaise = dto.minimumRaise;
    }
    if (dto.offeredDilution !== undefined) {
      updateData.offeredDilution = dto.offeredDilution;
    }
    if (dto.preMoneyValuation !== undefined) {
      updateData.preMoneyValuation = dto.preMoneyValuation;
    }
    if (dto.postMoneyValuation !== undefined) {
      updateData.postMoneyValuation = dto.postMoneyValuation;
    }
    if (dto.useOfFunds !== undefined) {
      updateData.useOfFunds = this.toJson(dto.useOfFunds);
    }
    if (dto.founderEquity !== undefined) {
      updateData.founderEquity = dto.founderEquity;
    }
    if (dto.employeePool !== undefined) {
      updateData.employeePool = dto.employeePool;
    }
    if (dto.investorEquity !== undefined) {
      updateData.investorEquity = dto.investorEquity;
    }
    if (dto.projectedRevenue !== undefined) {
      updateData.projectedRevenue = this.toJson(dto.projectedRevenue);
    }
    if (dto.projectedCustomers !== undefined) {
      updateData.projectedCustomers = this.toJson(dto.projectedCustomers);
    }

    const financial = await this.prisma.financial.update({
      where: { id: existingFinancial.id },
      data: updateData,
    });

    this.logger.log(`Financial updated for startup ${startupId}: ${financial.id}`);

    return financial;
  }

  /**
   * Financial kaydını siler (hard delete)
   */
  async delete(startupId: string, userId: string, userRole: UserRole) {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // Financial var mı kontrol et
    const existingFinancial = await this.prisma.financial.findFirst({
      where: { startupId },
    });

    if (!existingFinancial) {
      throw new NotFoundException(
        'Bu startup için henüz financial kaydı bulunmuyor.',
      );
    }

    await this.prisma.financial.delete({
      where: { id: existingFinancial.id },
    });

    this.logger.log(`Financial deleted for startup ${startupId}`);

    return { message: 'Financial bilgileri başarıyla silindi.' };
  }

  /**
   * Financial kaydı yoksa oluşturur, varsa günceller (Upsert)
   */
  async upsert(
    startupId: string,
    userId: string,
    userRole: UserRole,
    dto: CreateFinancialDto,
  ): Promise<{ data: any; created: boolean }> {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // Mevcut kayıt var mı kontrol et
    const existingFinancial = await this.prisma.financial.findFirst({
      where: { startupId },
    });

    if (existingFinancial) {
      // Build update data dynamically to handle JSON fields properly
      const updateData: Prisma.FinancialUpdateInput = {};

      if (dto.totalFundingRaised !== undefined) {
        updateData.totalFundingRaised = dto.totalFundingRaised;
      }
      if (dto.previousRounds !== undefined) {
        updateData.previousRounds = this.toJson(dto.previousRounds);
      }
      if (dto.previousInvestors !== undefined) {
        updateData.previousInvestors = this.toJson(dto.previousInvestors);
      }
      if (dto.fundingTarget !== undefined) {
        updateData.fundingTarget = dto.fundingTarget;
      }
      if (dto.minimumRaise !== undefined) {
        updateData.minimumRaise = dto.minimumRaise;
      }
      if (dto.offeredDilution !== undefined) {
        updateData.offeredDilution = dto.offeredDilution;
      }
      if (dto.preMoneyValuation !== undefined) {
        updateData.preMoneyValuation = dto.preMoneyValuation;
      }
      if (dto.postMoneyValuation !== undefined) {
        updateData.postMoneyValuation = dto.postMoneyValuation;
      }
      if (dto.useOfFunds !== undefined) {
        updateData.useOfFunds = this.toJson(dto.useOfFunds);
      }
      if (dto.founderEquity !== undefined) {
        updateData.founderEquity = dto.founderEquity;
      }
      if (dto.employeePool !== undefined) {
        updateData.employeePool = dto.employeePool;
      }
      if (dto.investorEquity !== undefined) {
        updateData.investorEquity = dto.investorEquity;
      }
      if (dto.projectedRevenue !== undefined) {
        updateData.projectedRevenue = this.toJson(dto.projectedRevenue);
      }
      if (dto.projectedCustomers !== undefined) {
        updateData.projectedCustomers = this.toJson(dto.projectedCustomers);
      }

      const financial = await this.prisma.financial.update({
        where: { id: existingFinancial.id },
        data: updateData,
      });

      this.logger.log(`Financial upserted (updated) for startup ${startupId}`);
      return { data: financial, created: false };
    }

    // Yeni kayıt oluştur
    const financial = await this.prisma.financial.create({
      data: {
        startupId,
        totalFundingRaised: dto.totalFundingRaised ?? 0,
        previousRounds: this.toJson(dto.previousRounds, []),
        previousInvestors: this.toJson(dto.previousInvestors, []),
        fundingTarget: dto.fundingTarget,
        minimumRaise: dto.minimumRaise,
        offeredDilution: dto.offeredDilution,
        preMoneyValuation: dto.preMoneyValuation,
        postMoneyValuation: dto.postMoneyValuation,
        useOfFunds: this.toJson(dto.useOfFunds, {}),
        founderEquity: dto.founderEquity,
        employeePool: dto.employeePool,
        investorEquity: dto.investorEquity,
        projectedRevenue: this.toJson(dto.projectedRevenue, {}),
        projectedCustomers: this.toJson(dto.projectedCustomers, {}),
      },
    });

    this.logger.log(`Financial upserted (created) for startup ${startupId}`);
    return { data: financial, created: true };
  }
}
