import type { DashboardRepository } from '../../domain/repositories/dashboardRepository'
import type { DashboardStats } from '../../domain/entities/dashboardStats'
import type { ActivityItem } from '../../domain/entities/activityItem'
import { dashboardRemote } from '../remote/dashboardRemoteDatasource'
import { reportCacheLocal } from '../local/reportCacheLocal'

export const dashboardRepositoryImpl: DashboardRepository = {
  async getStats(): Promise<DashboardStats> {
    const cached = await reportCacheLocal.get<DashboardStats>('dashboard_stats')
    if (cached) return cached
    const stats = await dashboardRemote.getStats()
    await reportCacheLocal.upsert('dashboard_stats', stats)
    return stats
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    return dashboardRemote.getRecentActivity()
  },
}
