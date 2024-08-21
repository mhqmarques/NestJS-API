import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ description: 'bookmark title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'bookmark description [optional]',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'bookmark link' })
  @IsString()
  @IsNotEmpty()
  link: string;
}
