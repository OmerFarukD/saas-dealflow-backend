import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FinancialsService } from './financials.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

@ApiTags('Financials')
@ApiBearerAuth()
@Controller('startups/:startupId/financials')
export class FinancialsController {
  constructor(private readonly financialsService: FinancialsService) {}

  /**
   * Startup'ın financial bilgilerini getirir
   */
  @Get()
  @ApiOperation({
    summary: 'Financial bilgilerini getir',
    description:
      "Startup'ın financial bilgilerini getirir. STARTUP sadece kendi startup'ını, INVESTOR sadece published startup'ları görebilir.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial bilgileri',
  })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ın financial bilgilerini görüntüleme yetkiniz yok",
  })
  @ApiResponse({
    status: 404,
    description: 'Startup bulunamadı veya financial kaydı yok',
  })
  async findOne(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.financialsService.findOne(startupId, user.id, user.role);
  }

  /**
   * Yeni financial kaydı oluşturur
   */
  @Post()
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Financial kaydı oluştur',
    description:
      "Startup için financial kaydı oluşturur. Her startup için sadece 1 kayıt olabilir. INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 201, description: 'Financial başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'a financial ekleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  @ApiResponse({
    status: 409,
    description: 'Bu startup için zaten financial kaydı mevcut',
  })
  async create(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateFinancialDto,
  ) {
    return this.financialsService.create(startupId, user.id, user.role, dto);
  }

  /**
   * Financial bilgilerini günceller
   */
  @Patch()
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Financial güncelle',
    description:
      "Financial bilgilerini günceller. INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Financial başarıyla güncellendi' })
  @ApiResponse({
    status: 400,
    description: 'Validation hatası veya geçersiz UUID',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ın financial bilgilerini güncelleme yetkiniz yok",
  })
  @ApiResponse({
    status: 404,
    description: 'Startup bulunamadı veya financial kaydı yok',
  })
  async update(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFinancialDto,
  ) {
    return this.financialsService.update(startupId, user.id, user.role, dto);
  }

  /**
   * Financial kaydını siler
   */
  @Delete()
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Financial sil',
    description:
      "Financial kaydını siler (hard delete). INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Financial başarıyla silindi' })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ın financial bilgilerini silme yetkiniz yok",
  })
  @ApiResponse({
    status: 404,
    description: 'Startup bulunamadı veya financial kaydı yok',
  })
  async delete(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.financialsService.delete(startupId, user.id, user.role);
  }

  /**
   * Financial kaydı yoksa oluşturur, varsa günceller (Upsert)
   */
  @Put()
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Financial upsert',
    description:
      "Financial kaydı yoksa oluşturur (201), varsa günceller (200). INVESTOR bu endpoint'i kullanamaz.",
  })
  @ApiParam({
    name: 'startupId',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Mevcut financial güncellendi',
  })
  @ApiResponse({
    status: 201,
    description: 'Yeni financial oluşturuldu',
  })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'a financial ekleme/güncelleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  async upsert(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateFinancialDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.financialsService.upsert(
      startupId,
      user.id,
      user.role,
      dto,
    );

    if (result.created) {
      res.status(HttpStatus.CREATED);
    }

    return result.data;
  }
}
