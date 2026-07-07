import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@omnibuilder.com' },
    update: { passwordHash },
    create: {
      email: 'admin@omnibuilder.com',
      passwordHash,
      fullName: 'John Doe',
    },
  });

  console.log(`  User: ${user.email}`);

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'omnibuilder-default' },
    update: {},
    create: {
      name: 'OmniBuilder Workspace',
      slug: 'omnibuilder-default',
    },
  });

  console.log(`  Organization: ${org.name}`);

  // Create admin role
  const role = await prisma.role.upsert({
    where: { organizationId_key: { organizationId: org.id, key: 'admin' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Administrator',
      key: 'admin',
      isSystem: true,
    },
  });

  // Link user to org
  await prisma.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      roleId: role.id,
    },
  });

  // Create additional users
  const users = [
    { email: 'alex@example.com', fullName: 'Alex Johnson' },
    { email: 'sarah@example.com', fullName: 'Sarah Williams' },
    { email: 'mark@example.com', fullName: 'Mark Collins' },
    { email: 'ella@example.com', fullName: 'Ella Bennett' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, passwordHash, fullName: u.fullName },
    });
  }

  // Create sample project
  const project = await prisma.project.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'techcorp-website' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'TechCorp Website',
      slug: 'techcorp-website',
      description: 'Corporate website built with Next.js',
      detectedFramework: 'Next.js',
      detectedRuntime: 'node',
      detectedLanguage: 'TypeScript',
      status: 'ready',
      createdById: user.id,
    },
  });

  // Create project environment
  await prisma.projectEnvironment.upsert({
    where: { id: project.id + '-prod' },
    update: {},
    create: {
      id: project.id + '-prod',
      projectId: project.id,
      name: 'production',
      isDefault: true,
    },
  }).catch(() => {
    // Ignore if already exists
  });

  console.log(`  Project: ${project.name}`);
  console.log('');
  console.log('Seed complete!');
  console.log('');
  console.log('  Login credentials:');
  console.log('  Email:    admin@omnibuilder.com');
  console.log('  Password: admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
