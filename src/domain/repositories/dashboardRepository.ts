import type { DashboardStats } from '../../domain/entities/dashboardStats'
import type { ActivityItem } from '../../domain/entities/activityItem'

export interface DashboardRepository {
  getStats(): Promise<DashboardStats>
  getRecentActivity(): Promise<ActivityItem[]>
}
