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
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1d' });
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
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");
    if (!user.email) {
      throw new UnauthorizedException('User email not found');
    }

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
    const existedUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { userIdentifier: result.user_identifier },
          { email: result.email },
        ],
      },
    });

    if (existedUser) {
      if (existedUser.id === user.id) {
        throw new BadRequestException('User ID already exists');
      }
      if (existedUser.userIdentifier === result.user_identifier) {
        throw new BadRequestException('User identifier already exists');
      }
      if (existedUser.email === result.email) {
        throw new BadRequestException('Email already exists');
      }
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