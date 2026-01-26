import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto, UserRegisterDto } from './dto/auth.dto';

@Controller('app')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/user_login/member')
  loginMember(
    @Body() body:UserLoginDto,
    @Headers('x-app-device-type') deviceType: string,
    @Headers('x-app-version') appVersion: string,
  ){
    return this.authService.loginMember(body, {
      deviceType,
      appVersion
    });
  }
  @Post('/user_register/member')
  registerMember(
    @Body() body:UserRegisterDto
  ){
    return this.authService.registerMember(body);
  }
}
