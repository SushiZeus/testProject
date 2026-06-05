import { Plus, BookOpen, Users, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useTrainingStore } from '@/store/trainingStore';
import type { AppRoute } from '@/App';

interface TrainingDashboardPageProps {
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
}

export function TrainingDashboardPage({ navigate }: TrainingDashboardPageProps) {
  const { user } = useAuthStore();
  const { courses, enrollments, certificates } = useTrainingStore();

  if (!user) return null;

  const canManage = ['hr_manager', 'administrator'].includes(user.role);

  const stats = {
    activeCourses: courses.filter(c => c.status === 'ACTIVE').length,
    totalEnrollments: enrollments.length,
    completedCourses: enrollments.filter(e => e.status === 'COMPLETED').length,
    certificatesIssued: certificates.length,
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training & Development</h1>
          <p className="text-gray-500 mt-1">Manage training courses and certifications</p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('training/courses')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCourses}</p>
                <p className="text-sm text-gray-500">Active Courses</p>
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
                <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                <p className="text-sm text-gray-500">Enrollments</p>
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
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.certificatesIssued}</p>
                <p className="text-sm text-gray-500">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common training tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('training/courses')}>
              <BookOpen className="w-4 h-4 mr-2" />
              View All Courses
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('training/enrollments')}>
              <Users className="w-4 h-4 mr-2" />
              View Enrollments
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('training/certificates')}>
              <Award className="w-4 h-4 mr-2" />
              View Certificates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Courses</CardTitle>
            <CardDescription>Starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.filter(c => c.status === 'ACTIVE').slice(0, 5).map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.category} • {course.duration}h</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(course.startDate)}</p>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{course.trainer}</Badge>
                  </div>
                </div>
              ))}
              {courses.filter(c => c.status === 'ACTIVE').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming courses</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
