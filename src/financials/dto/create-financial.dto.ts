import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PreviousRoundDto } from './previous-round.dto';
import { UseOfFundsDto } from './use-of-funds.dto';
import { ProjectionsDto } from './projections.dto';

export class CreateFinancialDto {
  // ============================================
  // PREVIOUS FUNDING
  // ============================================

  @ApiProperty({
    example: 2500000,
    description: 'Total funding raised to date ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalFundingRaised?: number;

  @ApiProperty({
    type: [PreviousRoundDto],
    description: 'Previous funding rounds',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousRoundDto)
  @IsOptional()
  previousRounds?: PreviousRoundDto[];

  @ApiProperty({
    example: ['Angel Investor X', 'VC Fund ABC'],
    description: 'List of previous investors',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  previousInvestors?: string[];

  // ============================================
  // CURRENT ASK
  // ============================================

  @ApiProperty({
    example: 5000000,
    description: 'Target funding amount ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fundingTarget?: number;

  @ApiProperty({
    example: 3000000,
    description: 'Minimum acceptable raise ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumRaise?: number;

  @ApiProperty({
    example: 20,
    description: 'Equity offered to investors (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  offeredDilution?: number;

  @ApiProperty({
    example: 20000000,
    description: 'Pre-money valuation ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  preMoneyValuation?: number;

  @ApiProperty({
    example: 25000000,
    description: 'Post-money valuation ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  postMoneyValuation?: number;

  // ============================================
  // USE OF FUNDS
  // ============================================

  @ApiProperty({
    type: UseOfFundsDto,
    description: 'How funds will be allocated (%)',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UseOfFundsDto)
  @IsOptional()
  useOfFunds?: UseOfFundsDto;

  // ============================================
  // CAP TABLE
  // ============================================

  @ApiProperty({
    example: 60,
    description: 'Founder equity (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  founderEquity?: number;

  @ApiProperty({
    example: 10,
    description: 'Employee option pool (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  employeePool?: number;

  @ApiProperty({
    example: 30,
    description: 'Investor equity (%)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  investorEquity?: number;

  // ============================================
  // PROJECTIONS
  // ============================================

  @ApiProperty({
    type: ProjectionsDto,
    description: 'Revenue projections by year ($)',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ProjectionsDto)
  @IsOptional()
  projectedRevenue?: ProjectionsDto;

  @ApiProperty({
    type: ProjectionsDto,
    description: 'Customer projections by year',
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ProjectionsDto)
  @IsOptional()
  projectedCustomers?: ProjectionsDto;
}
