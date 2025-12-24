import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMetricDto {
  // Revenue Metrics
  @ApiProperty({
    example: 50000,
    description: 'Monthly Recurring Revenue ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  mrr?: number;

  @ApiProperty({
    example: 600000,
    description: 'Annual Recurring Revenue ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  arr?: number;

  @ApiProperty({
    example: 100000,
    description: 'Total revenue for non-SaaS ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  revenue?: number;

  // Customer Metrics
  @ApiProperty({
    example: 150,
    description: 'Total customers',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalCustomers?: number;

  @ApiProperty({
    example: 120,
    description: 'Paying customers',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  payingCustomers?: number;

  @ApiProperty({
    example: 30,
    description: 'Trial customers',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  trialCustomers?: number;

  // Growth Metrics
  @ApiProperty({
    example: 15.5,
    description: 'Month-over-month growth (%)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  momGrowthRate?: number;

  @ApiProperty({
    example: 45.2,
    description: 'Quarter-over-quarter growth (%)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  qoqGrowthRate?: number;

  @ApiProperty({
    example: 180.0,
    description: 'Year-over-year growth (%)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  yoyGrowthRate?: number;

  // Retention Metrics
  @ApiProperty({
    example: 2.5,
    description: 'Monthly churn rate (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  churnRate?: number;

  @ApiProperty({
    example: 97.5,
    description: 'Customer retention rate (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  retentionRate?: number;

  @ApiProperty({
    example: 115,
    description: 'Net Revenue Retention (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  nrr?: number;

  // Unit Economics
  @ApiProperty({
    example: 500,
    description: 'Customer Acquisition Cost ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cac?: number;

  @ApiProperty({
    example: 6000,
    description: 'Customer Lifetime Value ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ltv?: number;

  @ApiProperty({
    example: 12,
    description: 'LTV to CAC ratio',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ltvCacRatio?: number;

  @ApiProperty({
    example: 4,
    description: 'Payback period in months',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  paybackPeriod?: number;

  // Financial Health
  @ApiProperty({
    example: 80000,
    description: 'Monthly burn rate ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  burnRate?: number;

  @ApiProperty({
    example: 18,
    description: 'Runway in months',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  runwayMonths?: number;

  @ApiProperty({
    example: 75,
    description: 'Gross margin (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  grossMargin?: number;

  @ApiProperty({
    example: 1500000,
    description: 'Cash balance ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cashBalance?: number;

  // Engagement Metrics
  @ApiProperty({
    example: 5000,
    description: 'Daily Active Users',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  dau?: number;

  @ApiProperty({
    example: 15000,
    description: 'Monthly Active Users',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  mau?: number;

  @ApiProperty({
    example: 0.33,
    description: 'DAU/MAU ratio (0-1)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  dauMauRatio?: number;

  // Metadata
  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Date of metrics recording',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @ApiProperty({
    example: 'Q4 2024 final metrics',
    description: 'Notes',
    required: false,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;
}
