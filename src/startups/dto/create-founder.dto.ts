import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFounderDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CEO & Co-Founder' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'john@startup.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://linkedin.com/in/johndoe', required: false })
  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({
    example: 'Serial entrepreneur with 10 years in SaaS...',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isFulltime?: boolean;

  @ApiProperty({ example: 40, required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  equityPercentage?: number;
}
