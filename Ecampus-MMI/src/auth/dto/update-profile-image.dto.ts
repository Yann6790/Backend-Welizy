import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileImageDto {
  @IsString({ message: "L'URL de l'image doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "L'URL de l'image est obligatoire" })
  imageUrl: string;
}
