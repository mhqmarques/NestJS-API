import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditBookmarkDto {
  @ApiPropertyOptional({ description: 'bookmark title [optional]' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'bookmark description [optional]',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'bookmark link [optional]' })
  @IsString()
  @IsOptional()
  link?: string;
}
