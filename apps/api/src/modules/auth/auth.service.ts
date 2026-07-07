import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: { email: string; password: string; fullName: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({ data: { email: dto.email, passwordHash, fullName: dto.fullName } });
    const org = await this.prisma.organization.create({ data: { name: `${dto.fullName}'s Workspace`, slug: `ws-${Date.now()}` } });
    const role = await this.prisma.role.create({ data: { organizationId: org.id, name: 'Administrator', key: 'admin', isSystem: true } });
    await this.prisma.organizationUser.create({ data: { organizationId: org.id, userId: user.id, roleId: role.id } });
    return this.generateTokens(user.id, user.email, user.fullName);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.generateTokens(user.id, user.email, user.fullName);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, fullName: true, avatarUrl: true, status: true } });
  }

  private generateTokens(userId: string, email: string, fullName: string) {
    const payload = { sub: userId, email };
    return { accessToken: this.jwt.sign(payload), user: { id: userId, email, fullName } };
  }
}
