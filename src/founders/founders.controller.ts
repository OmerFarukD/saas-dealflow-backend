import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FoundersService } from './founders.service';
import { CreateFounderDto } from './dto/create-founder.dto';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { ReorderFoundersDto } from './dto/reorder-founders.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Founders')
@Controller('startups/:startupId/founders') // Root path'i dokümana göre belirledik
export class FoundersController {
  constructor(private readonly foundersService: FoundersService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni founder ekle' })
  create(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Body() createFounderDto: CreateFounderDto,
  ) {
    return this.foundersService.create(startupId, createFounderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Startupın tüm founderlarını listele' })
  findAll(@Param('startupId', ParseUUIDPipe) startupId: string) {
    return this.foundersService.findAll(startupId);
  }

  @Get(':founderId')
  @ApiOperation({ summary: 'Tek bir founder detayı getir' })
  findOne(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('founderId', ParseUUIDPipe) founderId: string,
  ) {
    return this.foundersService.findOne(startupId, founderId);
  }

  @Patch('reorder') // Bu rota :founderId'den önce gelmeli ki çakışmasın
  @ApiOperation({ summary: 'Founder sıralamasını değiştir' })
  reorder(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Body() reorderDto: ReorderFoundersDto,
  ) {
    return this.foundersService.reorder(startupId, reorderDto.founderIds);
  }

  @Patch(':founderId')
  @ApiOperation({ summary: 'Founder bilgilerini güncelle' })
  update(
    @Param('founderId', ParseUUIDPipe) founderId: string,
    @Body() updateFounderDto: UpdateFounderDto,
  ) {
    return this.foundersService.update(founderId, updateFounderDto);
  }

  @Delete(':founderId')
  @ApiOperation({ summary: 'Founder sil' })
  remove(
    @Param('startupId', ParseUUIDPipe) startupId: string,
    @Param('founderId', ParseUUIDPipe) founderId: string,
  ) {
    return this.foundersService.remove(startupId, founderId);
  }
}
