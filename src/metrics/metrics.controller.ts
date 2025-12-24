import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { MetricQueryDto } from './dto/metric-query.dto';
import { MetricSummaryQueryDto } from './dto/metric-summary-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller('startups/:startupId/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Bir startup'ın metrik geçmişini listeler
   */
  @Get()
  @ApiOperation({
    summary: 'Metrik listesi',
    description:
      "Bir startup'ın metrik geçmişini listeler (pagination + filtering). STARTUP sadece kendi startup'ını, INVESTOR sadece published startup'ları görebilir.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrik listesi ve pagination meta',
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz UUID veya query parametresi',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ın metriklerini görüntüleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  async findAll(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: MetricQueryDto,
  ) {
    return this.metricsService.findAll(startupId, user.id, user.role, query);
  }

  /**
   * Startup'ın en son metriklerini getirir
   */
  @Get('latest')
  @ApiOperation({
    summary: 'Son metrikler',
    description: "Startup'ın en son kaydedilen metriklerini getirir.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'En son metrik kaydı',
  })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ın metriklerini görüntüleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup veya metrik bulunamadı' })
  async findLatest(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.metricsService.findLatest(startupId, user.id, user.role);
  }

  /**
   * Startup'ın metrik özetini ve trend analizini getirir
   */
  @Get('summary')
  @ApiOperation({
    summary: 'Metrik özeti ve trend',
    description:
      "Startup'ın metrik özetini ve belirtilen döneme göre trend analizini getirir.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrik özeti, önceki dönem ve trendler',
  })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID veya period değeri' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ın metriklerini görüntüleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  async getSummary(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: MetricSummaryQueryDto,
  ) {
    return this.metricsService.getSummary(startupId, user.id, user.role, query);
  }

  /**
   * Tek bir metrik kaydının detaylarını getirir
   */
  @Get(':metricId')
  @ApiOperation({
    summary: 'Metrik detay',
    description: 'Tek bir metrik kaydının detaylarını getirir.',
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'metricId',
    description: 'Metric UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrik detayları',
  })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: 'Bu metriği görüntüleme yetkiniz yok',
  })
  @ApiResponse({ status: 404, description: 'Startup veya Metrik bulunamadı' })
  async findOne(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('metricId', ParseUUIDPipe) metricId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.metricsService.findOne(startupId, metricId, user.id, user.role);
  }

  /**
   * Yeni metrik kaydı oluşturur
   */
  @Post()
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Yeni metrik ekleme',
    description:
      "Startup için yeni metrik kaydı (snapshot) oluşturur. INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 201, description: 'Metrik başarıyla oluşturuldu' })
  @ApiResponse({
    status: 400,
    description: 'Validation hatası veya tamamen boş metrik',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'a metrik ekleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  async create(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateMetricDto,
  ) {
    return this.metricsService.create(startupId, user.id, user.role, dto);
  }

  /**
   * Mevcut metrik kaydını günceller
   */
  @Patch(':metricId')
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Metrik güncelleme',
    description:
      "Mevcut metrik kaydını günceller. INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'metricId',
    description: 'Metric UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({ status: 200, description: 'Metrik başarıyla güncellendi' })
  @ApiResponse({
    status: 400,
    description: 'Validation hatası veya geçersiz UUID',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: 'Bu metriği güncelleme yetkiniz yok',
  })
  @ApiResponse({ status: 404, description: 'Startup veya Metrik bulunamadı' })
  async update(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('metricId', ParseUUIDPipe) metricId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateMetricDto,
  ) {
    return this.metricsService.update(
      startupId,
      metricId,
      user.id,
      user.role,
      dto,
    );
  }

  /**
   * Metrik kaydını siler
   */
  @Delete(':metricId')
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Metrik silme',
    description: "Metrik kaydını siler. INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'metricId',
    description: 'Metric UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({ status: 200, description: 'Metrik başarıyla silindi' })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: 'Bu metriği silme yetkiniz yok',
  })
  @ApiResponse({ status: 404, description: 'Startup veya Metrik bulunamadı' })
  async delete(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('metricId', ParseUUIDPipe) metricId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.metricsService.delete(startupId, metricId, user.id, user.role);
  }
}
