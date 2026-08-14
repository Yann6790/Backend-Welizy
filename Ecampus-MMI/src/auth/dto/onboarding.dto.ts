import { IsOptional, IsString } from 'class-validator';

export class OnboardingDto {
  @IsString({
    message: "L'identifiant de la promotion doit être une chaîne de caractères",
  })
  promotionId: string;

  @IsString({
    message: "L'identifiant du groupe doit être une chaîne de caractères",
  })
  groupId: string;

  @IsString({
    message: "L'URL de l'image de profil doit être une chaîne de caractères",
  })
  @IsOptional()
  imageUrl?: string;
}
