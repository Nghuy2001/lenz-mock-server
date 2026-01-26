import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserLoginDto, UserRegisterDto } from './dto/auth.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }
  private async generateTokens(payload: { id: string; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }
  async loginMember(
    dto: UserLoginDto,
    meta: { deviceType?: string; appVersion?: string },
  ) {
    const { login_name, password } = dto;
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: login_name },
          { userIdentifier: login_name },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid login_name or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");

    const payload = { id: user.id, email: user.email };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken,
        refreshToken,
      },
    });
    return {
      user: {
        id: user.id,
        type: user.type,
      },
      result: {
        token: accessToken,
        refresh_token: refreshToken,
        user_identifier: user.userIdentifier,
        user_name: user.userName,
        email: user.email,
        application_status: user.applicationStatus,
        setting: {
          push: user.pushEnabled ? '1' : '0',
        },
      },
      status: {
        timestamp: Math.floor(Date.now() / 1000),
      },
    };
  }
  async registerMember(dto: UserRegisterDto) {
    const { user, result, password } = dto;
    const existedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (existedUser) {
      throw new BadRequestException('User already exists');
    }
    const pushEnabled = result.setting?.push === '1';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.create({
      data: {
        id: user.id,
        type: user.type,
        userIdentifier: result.user_identifier,
        userName: result.user_name,
        email: result.email,
        password: hashedPassword,
        applicationStatus: Number(result.application_status),
        pushEnabled
      },
    });
    return { message: "Registration successful!" };
  }
}