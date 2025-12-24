import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { MetricQueryDto } from './dto/metric-query.dto';
import { MetricSummaryQueryDto } from './dto/metric-summary-query.dto';
import { UserRole, Prisma, Metric } from '@prisma/client';
import {
  PaginatedResult,
  PaginationHelper,
} from '../common/interfaces/pagination.interface';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

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
          'Yatırımcılar metrik ekleme/güncelleme/silme işlemi yapamaz.',
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
        "Sadece kendi startup'ınızın metriklerini yönetebilirsiniz.",
      );
    }

    return startup;
  }

  /**
   * Metrik kaydının en az bir alan içerip içermediğini kontrol eder
   */
  private validateNotEmpty(dto: CreateMetricDto | UpdateMetricDto): boolean {
    const metricFields = [
      'mrr',
      'arr',
      'revenue',
      'totalCustomers',
      'payingCustomers',
      'trialCustomers',
      'momGrowthRate',
      'qoqGrowthRate',
      'yoyGrowthRate',
      'churnRate',
      'retentionRate',
      'nrr',
      'cac',
      'ltv',
      'ltvCacRatio',
      'paybackPeriod',
      'burnRate',
      'runwayMonths',
      'grossMargin',
      'cashBalance',
      'dau',
      'mau',
      'dauMauRatio',
    ];

    return metricFields.some(
      (field) => dto[field] !== undefined && dto[field] !== null,
    );
  }

  /**
   * Yeni metrik kaydı oluşturur
   */
  async create(
    startupId: string,
    userId: string,
    userRole: UserRole,
    dto: CreateMetricDto,
  ) {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // En az bir metrik alanı dolu olmalı
    if (!this.validateNotEmpty(dto)) {
      throw new BadRequestException('En az bir metrik alanı doldurulmalıdır.');
    }

    const metric = await this.prisma.metric.create({
      data: {
        startupId,
        mrr: dto.mrr,
        arr: dto.arr,
        revenue: dto.revenue,
        totalCustomers: dto.totalCustomers,
        payingCustomers: dto.payingCustomers,
        trialCustomers: dto.trialCustomers,
        momGrowthRate: dto.momGrowthRate,
        qoqGrowthRate: dto.qoqGrowthRate,
        yoyGrowthRate: dto.yoyGrowthRate,
        churnRate: dto.churnRate,
        retentionRate: dto.retentionRate,
        nrr: dto.nrr,
        cac: dto.cac,
        ltv: dto.ltv,
        ltvCacRatio: dto.ltvCacRatio,
        paybackPeriod: dto.paybackPeriod,
        burnRate: dto.burnRate,
        runwayMonths: dto.runwayMonths,
        grossMargin: dto.grossMargin,
        cashBalance: dto.cashBalance,
        dau: dto.dau,
        mau: dto.mau,
        dauMauRatio: dto.dauMauRatio,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        notes: dto.notes,
      },
    });

    this.logger.log(`Metric created for startup ${startupId}: ${metric.id}`);

    return metric;
  }

  /**
   * Startup'ın metrik geçmişini listeler (pagination + filtering)
   */
  async findAll(
    startupId: string,
    userId: string,
    userRole: UserRole,
    query: MetricQueryDto,
  ): Promise<PaginatedResult<any>> {
    // Startup erişim kontrolü
    await this.validateStartupAccess(startupId, userId, userRole);

    // Build where clause
    const where: Prisma.MetricWhereInput = {
      startupId,
      ...(query.startDate && {
        recordedAt: {
          gte: new Date(query.startDate),
        },
      }),
      ...(query.endDate && {
        recordedAt: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          lte: new Date(query.endDate),
        },
      }),
    };

    // Count total
    const total = await this.prisma.metric.count({ where });

    // Default values
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const orderByField = query.orderBy ?? 'recordedAt';
    const orderDirection = query.order ?? 'desc';

    // Calculate skip
    const skip = PaginationHelper.getSkip(page, limit);

    // Build orderBy
    const orderBy: Prisma.MetricOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    // Fetch metrics
    const metrics = await this.prisma.metric.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Create pagination meta
    const meta = PaginationHelper.createMeta(page, limit, total);

    this.logger.debug(
      `Listed ${metrics.length} metrics for startup ${startupId} (page ${page}, total ${total})`,
    );

    return {
      data: metrics,
      meta,
    };
  }

  /**
   * Startup'ın en son metriklerini getirir
   */
  async findLatest(startupId: string, userId: string, userRole: UserRole) {
    // Startup erişim kontrolü
    await this.validateStartupAccess(startupId, userId, userRole);

    const metric = await this.prisma.metric.findFirst({
      where: { startupId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!metric) {
      throw new NotFoundException(
        'Bu startup için henüz metrik kaydı bulunmuyor.',
      );
    }

    return metric;
  }

  /**
   * Tek bir metrik kaydının detaylarını getirir
   */
  async findOne(
    startupId: string,
    metricId: string,
    userId: string,
    userRole: UserRole,
  ) {
    // Startup erişim kontrolü
    await this.validateStartupAccess(startupId, userId, userRole);

    const metric = await this.prisma.metric.findFirst({
      where: {
        id: metricId,
        startupId,
      },
    });

    if (!metric) {
      throw new NotFoundException('Metrik bulunamadı.');
    }

    return metric;
  }

  /**
   * Mevcut metrik kaydını günceller
   */
  async update(
    startupId: string,
    metricId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateMetricDto,
  ) {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // Metrik var mı kontrol et
    const existingMetric = await this.prisma.metric.findFirst({
      where: {
        id: metricId,
        startupId,
      },
    });

    if (!existingMetric) {
      throw new NotFoundException('Metrik bulunamadı.');
    }

    const metric = await this.prisma.metric.update({
      where: { id: metricId },
      data: {
        ...(dto.mrr !== undefined && { mrr: dto.mrr }),
        ...(dto.arr !== undefined && { arr: dto.arr }),
        ...(dto.revenue !== undefined && { revenue: dto.revenue }),
        ...(dto.totalCustomers !== undefined && {
          totalCustomers: dto.totalCustomers,
        }),
        ...(dto.payingCustomers !== undefined && {
          payingCustomers: dto.payingCustomers,
        }),
        ...(dto.trialCustomers !== undefined && {
          trialCustomers: dto.trialCustomers,
        }),
        ...(dto.momGrowthRate !== undefined && {
          momGrowthRate: dto.momGrowthRate,
        }),
        ...(dto.qoqGrowthRate !== undefined && {
          qoqGrowthRate: dto.qoqGrowthRate,
        }),
        ...(dto.yoyGrowthRate !== undefined && {
          yoyGrowthRate: dto.yoyGrowthRate,
        }),
        ...(dto.churnRate !== undefined && { churnRate: dto.churnRate }),
        ...(dto.retentionRate !== undefined && {
          retentionRate: dto.retentionRate,
        }),
        ...(dto.nrr !== undefined && { nrr: dto.nrr }),
        ...(dto.cac !== undefined && { cac: dto.cac }),
        ...(dto.ltv !== undefined && { ltv: dto.ltv }),
        ...(dto.ltvCacRatio !== undefined && { ltvCacRatio: dto.ltvCacRatio }),
        ...(dto.paybackPeriod !== undefined && {
          paybackPeriod: dto.paybackPeriod,
        }),
        ...(dto.burnRate !== undefined && { burnRate: dto.burnRate }),
        ...(dto.runwayMonths !== undefined && {
          runwayMonths: dto.runwayMonths,
        }),
        ...(dto.grossMargin !== undefined && { grossMargin: dto.grossMargin }),
        ...(dto.cashBalance !== undefined && { cashBalance: dto.cashBalance }),
        ...(dto.dau !== undefined && { dau: dto.dau }),
        ...(dto.mau !== undefined && { mau: dto.mau }),
        ...(dto.dauMauRatio !== undefined && { dauMauRatio: dto.dauMauRatio }),
        ...(dto.recordedAt !== undefined && {
          recordedAt: new Date(dto.recordedAt),
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    this.logger.log(`Metric updated: ${metricId}`);

    return metric;
  }

  /**
   * Metrik kaydını siler
   */
  async delete(
    startupId: string,
    metricId: string,
    userId: string,
    userRole: UserRole,
  ) {
    // Startup erişim kontrolü (write access gerekli)
    await this.validateStartupAccess(startupId, userId, userRole, true);

    // Metrik var mı kontrol et
    const existingMetric = await this.prisma.metric.findFirst({
      where: {
        id: metricId,
        startupId,
      },
    });

    if (!existingMetric) {
      throw new NotFoundException('Metrik bulunamadı.');
    }

    await this.prisma.metric.delete({
      where: { id: metricId },
    });

    this.logger.log(`Metric deleted: ${metricId}`);

    return { message: 'Metrik kaydı başarıyla silindi.' };
  }

  /**
   * Startup'ın metrik özetini ve trend analizini getirir
   */
  async getSummary(
    startupId: string,
    userId: string,
    userRole: UserRole,
    query: MetricSummaryQueryDto,
  ) {
    // Startup erişim kontrolü
    await this.validateStartupAccess(startupId, userId, userRole);

    // En son metriği getir
    const current = await this.prisma.metric.findFirst({
      where: { startupId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!current) {
      throw new NotFoundException(
        'Bu startup için henüz metrik kaydı bulunmuyor.',
      );
    }

    // Period'a göre tarih hesapla
    const periodMonths = this.getPeriodMonths(query.period || '6m');
    let previousDate: Date | null = null;

    if (periodMonths !== null) {
      previousDate = new Date(current.recordedAt);
      previousDate.setMonth(previousDate.getMonth() - periodMonths);
    }

    // Önceki metriği getir
    let previous: Metric | null = null;
    if (previousDate || query.period === 'all') {
      previous = await this.prisma.metric.findFirst({
        where: {
          startupId,
          recordedAt: previousDate
            ? { lte: previousDate }
            : { lt: current.recordedAt },
        },
        orderBy: { recordedAt: 'desc' },
      });
    }

    // Trend hesapla
    let trends: Record<string, any> | null = null;
    if (previous) {
      trends = this.calculateTrends(current, previous);
    }

    // Toplam data point sayısı
    const dataPoints = await this.prisma.metric.count({
      where: {
        startupId,
        ...(previousDate && {
          recordedAt: { gte: previousDate },
        }),
      },
    });

    return {
      current: this.formatMetricSummary(current),
      previous: previous ? this.formatMetricSummary(previous) : null,
      trends,
      period: query.period || '6m',
      dataPoints,
    };
  }

  /**
   * Period string'ini ay sayısına çevirir
   */
  private getPeriodMonths(period: string): number | null {
    const periodMap: Record<string, number | null> = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '12m': 12,
      all: null,
    };
    return periodMap[period] ?? 6;
  }

  /**
   * Metrik özetini formatlar
   */
  private formatMetricSummary(metric: Metric) {
    return {
      mrr: metric.mrr,
      arr: metric.arr,
      totalCustomers: metric.totalCustomers,
      churnRate: metric.churnRate,
      burnRate: metric.burnRate,
      runwayMonths: metric.runwayMonths,
      recordedAt: metric.recordedAt,
    };
  }

  /**
   * İki metrik arasındaki trend'leri hesaplar
   */
  private calculateTrends(current: Metric, previous: Metric) {
    const calculateChange = (
      curr: number | null,
      prev: number | null,
    ): { change: number; changePercent: number; direction: string } | null => {
      if (curr === null || prev === null || prev === 0) {
        return null;
      }

      const change = curr - prev;
      const changePercent = ((curr - prev) / Math.abs(prev)) * 100;
      const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

      return {
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        direction,
      };
    };

    const trends: Record<string, any> = {};

    const metricsToCompare: (keyof Metric)[] = [
      'mrr',
      'arr',
      'totalCustomers',
      'churnRate',
      'burnRate',
      'runwayMonths',
    ];

    for (const metricKey of metricsToCompare) {
      const currValue = current[metricKey] as number | null;
      const prevValue = previous[metricKey] as number | null;
      const trend = calculateChange(currValue, prevValue);
      if (trend) {
        trends[metricKey] = trend;
      }
    }

    return Object.keys(trends).length > 0 ? trends : null;
  }
}
