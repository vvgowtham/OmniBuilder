import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) where.OR = [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
    return this.prisma.user.findMany({
      where,
      select: { id: true, email: true, fullName: true, avatarUrl: true, status: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, avatarUrl: true, status: true, createdAt: true, lastLoginAt: true, memberships: { include: { organization: true, role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: { email: string; password: string; fullName: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } }).catch(() => null);
    if (existing) throw new ConflictException('Email already exists');
    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: { email: data.email, passwordHash, fullName: data.fullName },
      select: { id: true, email: true, fullName: true, status: true, createdAt: true },
    });
  }

  async update(id: string, data: { fullName?: string; status?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, status: true },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
