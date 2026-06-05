import { Plus, TrendingUp, Target, AlertTriangle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { usePerformanceStore } from '@/store/performanceStore';
import type { AppRoute } from '@/App';

interface PerformanceDashboardPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function PerformanceDashboardPage({ navigate }: PerformanceDashboardPageProps) {
  const { user } = useAuthStore();
  const { appraisals, goals, pips } = usePerformanceStore();

  if (!user) return null;

  const canManage = ['hr_manager', 'administrator'].includes(user.role) || user.role.includes('manager');

  const stats = {
    pendingAppraisals: appraisals.filter(a => a.status !== 'COMPLETED').length,
    activeGoals: goals.filter(g => g.status === 'ACTIVE').length,
    achievedGoals: goals.filter(g => g.status === 'ACHIEVED').length,
    activePIPs: pips.filter(p => p.status === 'ACTIVE').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-500 mt-1">Track appraisals, goals, and development</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => navigate('performance')}>
              <Plus className="w-4 h-4 mr-2" />
              New Appraisal
            </Button>
            <Button onClick={() => navigate('performance')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Set Goal
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingAppraisals}</p>
                <p className="text-sm text-gray-500">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeGoals}</p>
                <p className="text-sm text-gray-500">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.achievedGoals}</p>
                <p className="text-sm text-gray-500">Achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activePIPs}</p>
                <p className="text-sm text-gray-500">Active PIPs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common performance tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('performance/appraisals')}>
              <Award className="w-4 h-4 mr-2" />
              View Appraisals
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('performance/goals')}>
              <Target className="w-4 h-4 mr-2" />
              View Goals
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('performance/pips')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              View PIPs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Goals</CardTitle>
            <CardDescription>Goal progress tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.slice(0, 5).map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-gray-500">{goal.employeeName}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{goal.progress}%</p>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No goals set</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
