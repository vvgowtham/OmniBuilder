import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@omnibuilder.com' },
    update: {},
    create: { email: 'admin@omnibuilder.com', passwordHash, fullName: 'John Doe' },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'omnibuilder-default' },
    update: {},
    create: { name: 'OmniBuilder Workspace', slug: 'omnibuilder-default' },
  });

  const role = await prisma.role.upsert({
    where: { organizationId_key: { organizationId: org.id, key: 'admin' } },
    update: {},
    create: { organizationId: org.id, name: 'Administrator', key: 'admin', isSystem: true },
  });

  await prisma.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: {},
    create: { organizationId: org.id, userId: user.id, roleId: role.id },
  });

  console.log('Seed complete: admin@omnibuilder.com / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
