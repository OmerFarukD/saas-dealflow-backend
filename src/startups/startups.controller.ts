import {
  Body,
  Controller,
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
import { StartupsService } from './startups.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { StartupQueryDto } from './dto/startup-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

@ApiTags('Startups')
@ApiBearerAuth()
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @Post()
  @Roles(UserRole.STARTUP)
  @ApiOperation({
    summary: 'Yeni startup oluşturma',
    description:
      'STARTUP rolündeki kullanıcı için yeni startup ve founders oluşturur. Her kullanıcı sadece 1 startup oluşturabilir.',
  })
  @ApiResponse({ status: 201, description: 'Startup başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 403, description: 'Sadece STARTUP rolü kullanabilir' })
  @ApiResponse({
    status: 409,
    description: "Kullanıcının zaten bir startup'ı var",
  })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateStartupDto,
  ) {
    return this.startupsService.create(user.id, dto);
  }

  @Get()
  @Roles(UserRole.INVESTOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Tüm startupları listele',
    description:
      'Pagination, filtering ve sorting destekler. Sadece INVESTOR ve ADMIN rolleri kullanabilir.',
  })
  @ApiResponse({
    status: 200,
    description: 'Startup listesi ve pagination meta',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "STARTUP rolü bu endpoint'i kullanamaz",
  })
  async findAll(
    @CurrentUser() user: RequestUser,
    @Query() query: StartupQueryDto,
  ) {
    return this.startupsService.findAll(user.id, user.role, query);
  }

  @Get('me')
  @Roles(UserRole.STARTUP)
  @ApiOperation({
    summary: 'Kendi startup bilgilerini getir',
    description:
      'STARTUP rolündeki kullanıcının kendi startup bilgilerini getirir.',
  })
  @ApiResponse({ status: 200, description: 'Startup bilgileri' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 403, description: 'Sadece STARTUP rolü kullanabilir' })
  @ApiResponse({ status: 404, description: 'Henüz startup oluşturulmamış' })
  async findMyStartup(@CurrentUser() user: RequestUser) {
    return this.startupsService.findMyStartup(user.id);
  }

  /**
   * ID ile startup getirir
   * STARTUP: sadece kendi startup'ını görebilir
   * INVESTOR/ADMIN: tüm startupları görebilir
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Startup detayını getir',
    description:
      "ID ile startup detaylarını getirir. STARTUP rolü sadece kendi startup'ını görebilir.",
  })
  @ApiParam({
    name: 'id',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Startup detayları' })
  @ApiResponse({ status: 400, description: 'Geçersiz UUID formatı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ı görüntüleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.startupsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Startup güncelle',
    description:
      "Startup bilgilerini günceller. STARTUP rolü sadece kendi startup'ını güncelleyebilir.",
  })
  @ApiParam({
    name: 'id',
    description: 'Startup UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Startup güncellendi' })
  @ApiResponse({
    status: 400,
    description: 'Validation hatası veya geçersiz UUID',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: "Bu startup'ı güncelleme yetkiniz yok",
  })
  @ApiResponse({ status: 404, description: 'Startup bulunamadı' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateStartupDto,
  ) {
    return this.startupsService.update(id, user.id, user.role, dto);
  }
}
