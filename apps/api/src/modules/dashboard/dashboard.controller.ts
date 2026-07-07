import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  getStats(@Query('organizationId') orgId?: string) {
    return this.dashboard.getStats(orgId);
  }

  @Get('activity')
  getActivity() {
    return this.dashboard.getRecentActivity();
  }
}
