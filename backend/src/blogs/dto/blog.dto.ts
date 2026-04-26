import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title!: string; // <-- Added ! here

  @IsString()
  @IsNotEmpty()
  content!: string; // <-- Added ! here

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Summary must not exceed 255 characters' })
  summary?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Summary must not exceed 255 characters' })
  summary?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
