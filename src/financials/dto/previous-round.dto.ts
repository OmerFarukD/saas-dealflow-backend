import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreviousRoundDto {
  @ApiProperty({ example: 'Seed', description: 'Round name' })
  @IsString()
  roundName: string;

  @ApiProperty({ example: 2000000, description: 'Amount raised ($)' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Round date',
    required: false,
  })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: 'VC Fund ABC',
    description: 'Lead investor',
    required: false,
  })
  @IsString()
  @IsOptional()
  leadInvestor?: string;

  @ApiProperty({
    example: 15000000,
    description: 'Valuation at round ($)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  valuation?: number;
}
