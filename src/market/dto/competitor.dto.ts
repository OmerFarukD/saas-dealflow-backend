import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CompetitorDto {
  @ApiProperty({ example: 'Competitor A', description: 'Competitor name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://competitor.com', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: ['Brand recognition', 'Large customer base'],
    description: 'Competitor strengths',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  strengths?: string[];

  @ApiProperty({
    example: ['Outdated technology', 'Poor UX'],
    description: 'Competitor weaknesses',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  weaknesses?: string[];

  @ApiProperty({
    example: 25,
    description: 'Market share (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  marketShare?: number;

  @ApiProperty({
    example: '$500-5000/month',
    description: 'Pricing Info',
    required: false,
  })
  @IsString()
  @IsOptional()
  pricing?: string;
}
