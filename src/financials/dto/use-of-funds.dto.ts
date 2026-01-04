import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UseOfFundsDto {
  @ApiProperty({
    example: 40,
    description: 'Engineering percentage',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  engineering?: number;

  @ApiProperty({
    example: 25,
    description: 'Sales percentage',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  sales?: number;

  @ApiProperty({
    example: 20,
    description: 'Marketing percentage',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  marketing?: number;

  @ApiProperty({
    example: 15,
    description: 'Operations percentage',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  operations?: number;

  @ApiProperty({
    example: 0,
    description: 'Other percentage',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  other?: number;
}
