import { IsNotEmpty, IsHexColor, IsOptional, IsIn, IsString, IsBoolean } from 'class-validator';

export class CreateThemeDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  gradient?: string;

  @IsOptional()
  @IsIn(['color', 'gradient', 'image'])
  backgroundType?: 'color' | 'gradient' | 'image';

  @IsOptional()
  @IsIn(['light', 'dark', 'glass'])
  mode?: 'light' | 'dark' | 'glass';

  @IsOptional()
  @IsIn(['rounded', 'square'])
  borderStyle?: 'rounded' | 'square';

  @IsOptional()
  @IsIn(['none', 'normal', 'deep'])
  cardShadow?: 'none' | 'normal' | 'deep';

  @IsOptional()
  @IsIn(['full', 'boxed', 'minimal', 'glass'])
  layoutType?: 'full' | 'boxed' | 'minimal' | 'glass';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
