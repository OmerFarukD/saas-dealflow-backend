import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CompetitorDto } from './competitor.dto';
import { IdealCustomerProfileDto } from './ideal-customer-profile.dto';

export class CreateMarketDto {
  // ============================================
  // MARKET SIZE
  // ============================================

  @ApiProperty({
    example: 50000000000,
    description: 'TAM ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tam?: number;

  @ApiProperty({ example: 5000000000, description: 'SAM ($)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sam?: number;

  @ApiProperty({ example: 500000000, description: 'SOM ($)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  som?: number;

  // ============================================
  // TARGET MARKET
  // ============================================

  @ApiProperty({ example: 'Enterprise Software', required: false })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  targetSector?: string;

  @ApiProperty({ example: ['Technology', 'Finance'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIndustries?: string[];

  @ApiProperty({ example: 'North America, Europe', required: false })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  targetGeography?: string;

  @ApiProperty({
    example: 'B2B',
    enum: ['B2B', 'B2C', 'B2B2C', 'B2G', 'D2C'],
    required: false,
  })
  @IsString()
  @IsOptional()
  targetCustomerType?: string;

  // ============================================
  // IDEAL CUSTOMER PROFILE
  // ============================================

  @ApiProperty({ type: IdealCustomerProfileDto, required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => IdealCustomerProfileDto)
  @IsOptional()
  idealCustomerProfile?: IdealCustomerProfileDto;

  // ============================================
  // COMPETITION
  // ============================================

  @ApiProperty({ type: [CompetitorDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetitorDto)
  @IsOptional()
  competitors?: CompetitorDto[];

  @ApiProperty({ example: 'Legacy players analysis...', required: false })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  competitiveLandscape?: string;

  @ApiProperty({ example: 'Key differentiators...', required: false })
  @IsString()
  @MaxLength(3000)
  @IsOptional()
  differentiation?: string;

  @ApiProperty({ example: 'Competitive moat...', required: false })
  @IsString()
  @MaxLength(3000)
  @IsOptional()
  moat?: string;

  // ============================================
  // MARKET DYNAMICS
  // ============================================

  @ApiProperty({
    example: 25.5,
    description: 'Growth rate (%)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  marketGrowthRate?: number;

  @ApiProperty({ example: ['AI automation'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  marketTrends?: string[];

  @ApiProperty({ example: 'GDPR compliance...', required: false })
  @IsString()
  @MaxLength(3000)
  @IsOptional()
  regulatoryFactors?: string;

  // ============================================
  // GO-TO-MARKET
  // ============================================

  @ApiProperty({ example: 'GTM strategy details...', required: false })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  gtmStrategy?: string;

  @ApiProperty({ example: ['Direct sales'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  salesChannels?: string[];
}
