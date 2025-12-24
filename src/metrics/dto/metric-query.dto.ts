import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MetricQueryDto {
  @ApiProperty({ example: 1, default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, default: 10, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    example: 'recordedAt',
    enum: ['recordedAt', 'mrr', 'arr', 'totalCustomers', 'createdAt'],
    default: 'recordedAt',
    required: false,
  })
  @IsString()
  @IsIn(['recordedAt', 'mrr', 'arr', 'totalCustomers', 'createdAt'])
  @IsOptional()
  orderBy?: 'recordedAt' | 'mrr' | 'arr' | 'totalCustomers' | 'createdAt' =
    'recordedAt';

  @ApiProperty({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}
