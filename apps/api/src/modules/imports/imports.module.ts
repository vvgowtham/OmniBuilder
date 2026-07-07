import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'imports' })],
  controllers: [ImportsController],
  providers: [ImportsService],
  exports: [ImportsService],
})
export class ImportsModule {}
