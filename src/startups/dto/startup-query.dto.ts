import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StartupCategory, StartupStage, StartupStatus } from '@prisma/client';

export class StartupQueryDto {
  // ============================================
  // PAGINATION
  // ============================================

  @ApiProperty({
    description: 'Sayfa numarası (1-based)',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Sayfa başına kayıt sayısı',
    example: 10,
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  // ============================================
  // FILTERING
  // ============================================

  @ApiProperty({
    description: 'Startup aşaması',
    enum: StartupStage,
    example: StartupStage.SEED,
    required: false,
  })
  @IsEnum(StartupStage)
  @IsOptional()
  stage?: StartupStage;

  @ApiProperty({
    description: 'Startup kategorisi',
    enum: StartupCategory,
    example: StartupCategory.AI_AGENT,
    required: false,
  })
  @IsEnum(StartupCategory)
  @IsOptional()
  category?: StartupCategory;

  @ApiProperty({
    description: 'Startup durumu',
    enum: StartupStatus,
    example: StartupStatus.ACTIVE,
    required: false,
  })
  @IsEnum(StartupStatus)
  @IsOptional()
  status?: StartupStatus;

  @ApiProperty({
    description: 'Lokasyon filtresi (kısmi eşleşme)',
    example: 'San Francisco',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Arama terimi (şirket adı, tagline içinde arar)',
    example: 'AI',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sadece yayınlanmış startupları getir',
    example: true,
    default: true,
    required: false,
  })
  @Type(() => Boolean)
  @IsOptional()
  isPublished?: boolean = true;

  // ============================================
  // SORTING
  // ============================================

  @ApiProperty({
    description: 'Sıralama alanı',
    enum: ['createdAt', 'companyName', 'stage'],
    example: 'createdAt',
    default: 'createdAt',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderBy?: 'createdAt' | 'companyName' | 'stage' = 'createdAt';

  @ApiProperty({
    description: 'Sıralama yönü',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
    required: false,
  })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}
