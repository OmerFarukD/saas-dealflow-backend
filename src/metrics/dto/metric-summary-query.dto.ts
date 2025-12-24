import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MetricSummaryQueryDto {
  @ApiProperty({
    example: '6m',
    enum: ['1m', '3m', '6m', '12m', 'all'],
    default: '6m',
    description: 'Time period for comparison',
    required: false,
  })
  @IsString()
  @IsIn(['1m', '3m', '6m', '12m', 'all'])
  @IsOptional()
  period?: '1m' | '3m' | '6m' | '12m' | 'all' = '6m';
}
