import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertTriangle, Calendar, Heart, BookOpen, Activity, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

interface Risk {
  id: string;
  symptoms: string;
  severity: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  providerName: string;
  attended: boolean;
}

function PatientDashboardContent() {
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user?.userType === 'provider') {
      navigate('/provider-dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);

  const fetchData = async () => {
    try {
      const [risksRes, appointmentsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/risks`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/appointments`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (risksRes.ok) {
        const risksData = await risksRes.json();
        setRisks(risksData.risks);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments
    .filter(a => a.status === 'scheduled' && !a.attended)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentRisks = risks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'assigned':
        return 'default';
      case 'resolved':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Here's an overview of your pregnancy journey</p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/report-risk')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Report Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Flag any health concerns</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/appointments')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Schedule antenatal care</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/education')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learn More</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Pregnancy do's & don'ts</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/profile')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">View your information</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Recent Risk Reports
              </CardTitle>
              <CardDescription>Your latest health concerns</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : recentRisks.length === 0 ? (
                <p className="text-sm text-gray-500">No risks reported yet</p>
              ) : (
                <div className="space-y-4">
                  {recentRisks.map((risk) => (
                    <div key={risk.id} className="border-l-4 border-pink-600 pl-4 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.symptoms}</p>
                          <p className="text-xs text-gray-600 mt-1">{risk.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(risk.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getSeverityColor(risk.severity) as any}>
                            {risk.severity}
                          </Badge>
                          <Badge variant={getStatusColor(risk.status) as any}>
                            {risk.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/report-risk')}
              >
                Report New Risk
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled antenatal visits</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming appointments</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{appointment.type}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Provider: {appointment.providerName}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </div>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/appointments')}
              >
                View All Appointments
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Risks Reported</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{risks.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{appointments.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Appointments Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {appointments.filter(a => a.attended).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export function PatientDashboard() {
  return <PatientDashboardContent />;
}
