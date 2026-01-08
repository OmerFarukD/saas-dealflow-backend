import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FoundersService } from './founders.service';
import { CreateFounderDto } from './dto/create-founder.dto';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { ReorderFoundersDto } from './dto/reorder-founders.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

@ApiTags('Founders')
@ApiBearerAuth()
@Controller('startups/:startupId/founders')
export class FoundersController {
  constructor(private readonly foundersService: FoundersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVESTOR, UserRole.STARTUP)
  @ApiOperation({ summary: 'Founder listesi' })
  @ApiParam({ name: 'startupId', description: 'Startup UUID' })
  async findAll(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.foundersService.findAll(startupId, user.id, user.role);
  }

  @Get(':founderId')
  @Roles(UserRole.ADMIN, UserRole.INVESTOR, UserRole.STARTUP)
  @ApiOperation({ summary: 'Founder detay' })
  async findOne(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('founderId', ParseUUIDPipe) founderId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.foundersService.findOne(
      startupId,
      founderId,
      user.id,
      user.role,
    );
  }

  @Post()
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Yeni founder ekleme' })
  async create(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateFounderDto,
  ) {
    return this.foundersService.create(startupId, user.id, user.role, dto);
  }

  @Patch('reorder')
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Sıralama değiştirme' })
  async reorder(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ReorderFoundersDto,
  ) {
    return this.foundersService.reorder(
      startupId,
      user.id,
      user.role,
      dto.founderIds,
    );
  }

  @Patch(':founderId')
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Founder güncelleme' })
  async update(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('founderId', ParseUUIDPipe) founderId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFounderDto,
  ) {
    return this.foundersService.update(
      startupId,
      founderId,
      user.id,
      user.role,
      dto,
    );
  }

  @Delete(':founderId')
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Founder silme' })
  @ApiResponse({ status: 200, description: 'Founder başarıyla silindi.' })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz UUID veya son founder silinemez hatası',
  })
  async remove(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('founderId', ParseUUIDPipe) founderId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.foundersService.remove(
      startupId,
      founderId,
      user.id,
      user.role,
    );
  }
}
