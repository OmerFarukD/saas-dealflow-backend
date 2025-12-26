import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Berkay Kaplan', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsUrl()
  @IsOptional()
  profilePhotoUrl?: string;
}
