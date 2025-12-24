import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { StartupQueryDto } from './dto/startup-query.dto';
import { UserRole, Prisma } from '@prisma/client';
import {
  PaginatedResult,
  PaginationHelper,
} from '../common/interfaces/pagination.interface';

@Injectable()
export class StartupsService {
  private readonly logger = new Logger(StartupsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Yeni startup oluşturur (founders ile birlikte)
   * @param userId - Startup sahibi user ID
   * @param dto - Startup ve founders bilgileri
   */
  async create(userId: string, dto: CreateStartupDto) {
    // Check if user already has a startup
    const existingStartup = await this.prisma.startup.findUnique({
      where: { userId },
    });

    if (existingStartup) {
      throw new ConflictException('Kullanıcının zaten bir startup\'ı mevcut.');
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
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    this.logger.log(`Startup created: ${startup.companyName} (${startup.id})`);

    return startup;
  }

  /**
   * Tüm startupları listeler (pagination + filtering)
   * Sadece INVESTOR ve ADMIN rolleri için
   * @param userId - İstek yapan user ID
   * @param userRole - İstek yapan user rolü
   * @param query - Pagination ve filter parametreleri
   */
  async findAll(
    userId: string,
    userRole: UserRole,
    query: StartupQueryDto,
  ): Promise<PaginatedResult<any>> {
    // STARTUP rolü diğer startupları göremez
    if (userRole === UserRole.STARTUP) {
      throw new ForbiddenException(
        'Startup rolündekiler başka startupları görüntüleyemez.',
      );
    }

    // Build where clause
    const where: Prisma.StartupWhereInput = {
      // Default: sadece aktif ve yayınlanmış
      ...(query.status ? { status: query.status } : { status: 'ACTIVE' }),
      ...(query.isPublished !== undefined && { isPublished: query.isPublished }),

      // Filters
      ...(query.stage && { stage: query.stage }),
      ...(query.category && { category: query.category }),
      ...(query.location && {
        location: {
          contains: query.location,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),

      // Search (company name veya tagline içinde)
      ...(query.search && {
        OR: [
          {
            companyName: {
              contains: query.search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            tagline: {
              contains: query.search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      }),
    };

    // Count total for pagination
    const total = await this.prisma.startup.count({ where });

    // Default values (DTO'dan gelmezse)
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const orderByField = query.orderBy ?? 'createdAt';
    const orderDirection = query.order ?? 'desc';

    // Calculate skip
    const skip = PaginationHelper.getSkip(page, limit);

    // Build orderBy
    const orderBy: Prisma.StartupOrderByWithRelationInput = {
      [orderByField]: orderDirection,
    };

    // Fetch startups
    const startups = await this.prisma.startup.findMany({
      where,
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            role: true,
            linkedinUrl: true,
            photoUrl: true,
            isFulltime: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        // Latest score (if exists)
        scores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
          select: {
            totalScore: true,
            calculatedAt: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Create pagination meta
    const meta = PaginationHelper.createMeta(page, limit, total);

    this.logger.debug(
      `Listed ${startups.length} startups (page ${page}, total ${total})`,
    );

    return {
      data: startups,
      meta,
    };
  }

  /**
   * ID ile startup getirir
   * STARTUP rolü sadece kendi startup'ını görebilir
   * @param id - Startup ID
   * @param userId - İstek yapan user ID
   * @param userRole - İstek yapan user rolü
   */
  async findOne(id: string, userId: string, userRole: UserRole) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        // Include more details for single view
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        financials: {
          take: 1,
        },
        market: true,
        scores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup bulunamadı.');
    }

    // STARTUP rolü sadece kendi startup'ını görebilir
    if (userRole === UserRole.STARTUP && startup.userId !== userId) {
      throw new ForbiddenException(
        'Sadece kendi startup\'ınızı görüntüleyebilirsiniz.',
      );
    }

    return startup;
  }

  /**
   * Kullanıcının kendi startup'ını getirir
   * @param userId - User ID
   */
  async findMyStartup(userId: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { userId },
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
        financials: {
          take: 1,
        },
        market: true,
        scores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
        insights: {
          where: { isVisible: true, isArchived: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!startup) {
      throw new NotFoundException('Henüz bir startup bilgisi mevcut değil.');
    }

    return startup;
  }

  /**
   * Startup günceller
   * STARTUP: sadece kendi startup'ını
   * ADMIN: tüm startupları güncelleyebilir
   * @param id - Startup ID
   * @param userId - İstek yapan user ID
   * @param userRole - İstek yapan user rolü
   * @param dto - Güncellenecek alanlar
   */
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

    // Permission check
    if (userRole !== UserRole.ADMIN && startup.userId !== userId) {
      throw new ForbiddenException(
        'Sadece kendi startup bilgilerinizi güncelleyebilirsiniz.',
      );
    }

    const updated = await this.prisma.startup.update({
      where: { id },
      data: dto,
      include: {
        founders: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    this.logger.log(`Startup updated: ${updated.companyName} (${updated.id})`);

    return updated;
  }
}