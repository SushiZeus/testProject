import { Plus, Briefcase, Users, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useRecruitmentStore } from '@/store/recruitmentStore';
import type { AppRoute } from '@/App';

interface RecruitmentDashboardPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function RecruitmentDashboardPage({ navigate }: RecruitmentDashboardPageProps) {
  const { user } = useAuthStore();
  const { jobs, applicants, interviews } = useRecruitmentStore();

  if (!user) return null;

  const canManage = ['hr_manager', 'administrator'].includes(user.role);

  const stats = {
    openJobs: jobs.filter(j => j.status === 'OPEN').length,
    totalApplicants: applicants.length,
    pendingInterviews: interviews.filter(i => i.status === 'SCHEDULED').length,
    offersExtended: applicants.filter(a => a.status === 'OFFERED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-500 mt-1">Manage job postings and applicants</p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('recruitment')}>
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openJobs}</p>
                <p className="text-sm text-gray-500">Open Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalApplicants}</p>
                <p className="text-sm text-gray-500">Applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingInterviews}</p>
                <p className="text-sm text-gray-500">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.offersExtended}</p>
                <p className="text-sm text-gray-500">Offers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common recruitment tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('recruitment/jobs')}>
              <Briefcase className="w-4 h-4 mr-2" />
              View All Jobs
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('recruitment/applicants')}>
              <Users className="w-4 h-4 mr-2" />
              View Applicants
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('recruitment/interviews')}>
              <Calendar className="w-4 h-4 mr-2" />
              Interview Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Currently hiring for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.filter(j => j.status === 'OPEN').slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.department} • {job.location}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700">{job.openings} openings</Badge>
                  </div>
                </div>
              ))}
              {jobs.filter(j => j.status === 'OPEN').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No open positions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
