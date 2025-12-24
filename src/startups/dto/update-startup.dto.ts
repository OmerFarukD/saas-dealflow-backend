import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StartupCategory, StartupStage, StartupStatus } from '@prisma/client';

export class UpdateStartupDto {
  @ApiProperty({ example: 'TechCorp AI', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: 'AI-powered automation', required: false })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiProperty({ enum: StartupStage, required: false })
  @IsEnum(StartupStage)
  @IsOptional()
  stage?: StartupStage;

  @ApiProperty({ enum: StartupCategory, required: false })
  @IsEnum(StartupCategory)
  @IsOptional()
  category?: StartupCategory;

  @ApiProperty({ example: 'https://techcorp.ai', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'San Francisco, CA', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'We help companies automate customer support...',
    required: false,
  })
  @IsString()
  @IsOptional()
  elevatorPitch?: string;

  @ApiProperty({ enum: StartupStatus, required: false })
  @IsEnum(StartupStatus)
  @IsOptional()
  status?: StartupStatus;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
