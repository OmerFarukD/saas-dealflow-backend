import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StartupsService } from './startups.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Startups')
@ApiBearerAuth()
@Controller('startups')
export class StartupsController {
  constructor(private startupsService: StartupsService) {}

  @Post()
  @Roles(UserRole.STARTUP)
  @ApiOperation({ summary: 'Yeni Startup oluşturma' })
  async create(@CurrentUser() user: any, @Body() dto: CreateStartupDto) {
    return this.startupsService.create(user.id, dto);
  }

  @Get()
  @Roles(UserRole.INVESTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all startups (Investor & Admin only)' })
  async findAll(@CurrentUser() user: any) {
    return this.startupsService.findAll(user.id, user.role);
  }

  @Get('me')
  @Roles(UserRole.STARTUP)
  @ApiOperation({ summary: 'Get my startup (Startup role only)' })
  async findMyStartup(@CurrentUser() user: any) {
    return this.startupsService.findMyStartup(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get startup by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.startupsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update startup' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateStartupDto,
  ) {
    return this.startupsService.update(id, user.id, user.role, dto);
  }
}
