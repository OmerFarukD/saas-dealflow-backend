import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectionsDto {
  @ApiProperty({
    example: 1200000,
    description: 'Year 1 projection',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  year1?: number;

  @ApiProperty({
    example: 3600000,
    description: 'Year 2 projection',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  year2?: number;

  @ApiProperty({
    example: 10000000,
    description: 'Year 3 projection',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  year3?: number;

  @ApiProperty({
    example: 25000000,
    description: 'Year 4 projection',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  year4?: number;

  @ApiProperty({
    example: 50000000,
    description: 'Year 5 projection',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  year5?: number;
}
