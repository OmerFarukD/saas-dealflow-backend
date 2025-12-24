import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StartupCategory, StartupStage } from '@prisma/client';
import { CreateFounderDto } from './create-founder.dto';

export class CreateStartupDto {
  @ApiProperty({ example: 'TechCorp AI' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'AI-powered customer support automation' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiProperty({ enum: StartupStage, example: StartupStage.SEED })
  @IsEnum(StartupStage)
  stage: StartupStage;

  @ApiProperty({ enum: StartupCategory, example: StartupCategory.AI_AGENT })
  @IsEnum(StartupCategory)
  category: StartupCategory;

  @ApiProperty({ example: 'https://techcorp.ai', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'San Francisco, CA', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    type: [CreateFounderDto],
    description: 'At least one founder is required',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one founder is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateFounderDto)
  founders: CreateFounderDto[];
}
