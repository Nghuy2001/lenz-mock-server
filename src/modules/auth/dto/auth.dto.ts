import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsObject, IsString } from "class-validator";

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  login_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
class UserSettingDto {
  @IsString()
  push: string;
}

class UserDto {
  @IsInt()
  type: number;

  @IsString()
  id: string;
}
class UserResultDto {
  @IsString()
  token: string;

  @IsString()
  refresh_token: string;

  @IsString()
  user_identifier: string;

  @IsString()
  user_name: string;

  @IsEmail()
  email: string;

  @IsString()
  application_status: string;

  @IsObject()
  @Type(() => UserSettingDto)
  setting: UserSettingDto;
}

export class UserRegisterDto {
  @IsObject()
  @Type(() => UserDto)
  user: UserDto;

  @IsObject()
  @Type(() => UserResultDto)
  result: UserResultDto;
  
  @IsString()
  @IsNotEmpty()
  password: string;
}
