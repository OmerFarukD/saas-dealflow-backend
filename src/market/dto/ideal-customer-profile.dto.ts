import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdealCustomerProfileDto {
  @ApiProperty({ example: '50-500 employees', required: false })
  @IsString()
  @IsOptional()
  companySize?: string;

  @ApiProperty({ example: '$10M-$100M ARR', required: false })
  @IsString()
  @IsOptional()
  revenue?: string;

  @ApiProperty({ example: 'SaaS, Fintech', required: false })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({ example: 'US, UK, Germany', required: false })
  @IsString()
  @IsOptional()
  geography?: string;

  @ApiProperty({
    example: ['Manual processes', 'High ticket volume'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  painPoints?: string[];

  @ApiProperty({ example: 'VP of Customer Success, CTO', required: false })
  @IsString()
  @IsOptional()
  buyerPersona?: string;

  @ApiProperty({
    example: ['ROI', 'Integration ease', 'Security'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  decisionCriteria?: string[];

  @ApiProperty({ example: '3-6 months', required: false })
  @IsString()
  @IsOptional()
  salesCycle?: string;

  @ApiProperty({ example: '$20,000', required: false })
  @IsString()
  @IsOptional()
  averageDealSize?: string;
}
