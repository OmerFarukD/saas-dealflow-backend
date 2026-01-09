import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { MarketService } from './market.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Market')
@ApiBearerAuth()
@Controller('startups/:startupId/market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get()
  // STARTUP, ADMIN ve INVESTOR görebilir
  @Roles(UserRole.ADMIN, UserRole.INVESTOR, UserRole.STARTUP)
  @ApiOperation({ summary: 'Market analizini getirir' })
  @ApiParam({ name: 'startupId', description: 'Startup UUID' })
  async findOne(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.marketService.findOne(startupId, user.id, user.role);
  }

  @Post()
  // Sadece STARTUP ve ADMIN oluşturabilir
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Market kaydı oluşturur' })
  @ApiResponse({
    status: 201,
    description: 'Market kaydı başarıyla oluşturuldu.',
  })
  async create(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: { id: string; role: UserRole },
    @Body() dto: CreateMarketDto,
  ) {
    return this.marketService.create(startupId, user.id, user.role, dto);
  }

  @Patch()
  // STARTUP ve ADMIN güncelleyebilir
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Market bilgilerini günceller' })
  async update(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: { id: string; role: UserRole },
    @Body() dto: UpdateMarketDto,
  ) {
    return this.marketService.update(startupId, user.id, user.role, dto);
  }

  @Delete()
  // STARTUP ve ADMIN silebilir
  @Roles(UserRole.STARTUP, UserRole.ADMIN)
  @ApiOperation({ summary: 'Market kaydını siler' })
  async remove(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.marketService.remove(startupId, user.id, user.role);
  }
}
