import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ImportsModule } from './modules/imports/imports.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { BuilderModule } from './modules/builder/builder.module';
import { PagesModule } from './modules/pages/pages.module';
import { MediaModule } from './modules/media/media.module';
import { SyncModule } from './modules/sync/sync.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({ redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 } }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    ImportsModule,
    AnalysisModule,
    BuilderModule,
    PagesModule,
    MediaModule,
    SyncModule,
    DeploymentsModule,
    HealthModule,
  ],
})
export class AppModule {}
