import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { AlertTriangle, Calendar, Users, Activity, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

interface Risk {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string;
  severity: string;
  description: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  attended: boolean;
  notes: string;
}

function ProviderDashboardContent() {
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [riskStatus, setRiskStatus] = useState<string>('');
  const [riskNotes, setRiskNotes] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user?.userType === 'patient') {
      navigate('/patient-dashboard');
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

  const handleUpdateRisk = async (riskId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/risks/${riskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: riskStatus, notes: riskNotes }),
        }
      );

      if (response.ok) {
        toast.success('Risk updated successfully');
        setEditingRisk(null);
        setRiskStatus('');
        setRiskNotes('');
        fetchData();
      } else {
        toast.error('Failed to update risk');
      }
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error('Failed to update risk');
    }
  };

  const handleMarkAttended = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ attended: true, status: 'completed' }),
        }
      );

      if (response.ok) {
        toast.success('Appointment marked as attended');
        fetchData();
      } else {
        toast.error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
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

  const todayAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date).toDateString();
    const today = new Date().toDateString();
    return appointmentDate === today && !a.attended;
  });

  const pendingRisks = risks.filter(r => r.status === 'assigned' || r.status === 'pending');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, Dr. {user.name}
          </h1>
          <p className="text-gray-600">Your patient care overview</p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-pink-600" />
                <p className="text-3xl font-bold">{new Set(risks.map(r => r.patientId)).size}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <p className="text-3xl font-bold">{pendingRisks.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <p className="text-3xl font-bold">{todayAppointments.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <p className="text-3xl font-bold">{appointments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Patient Risk Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Patient Risk Reports
              </CardTitle>
              <CardDescription>Review and respond to patient concerns</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : risks.length === 0 ? (
                <p className="text-sm text-gray-500">No patient risks assigned</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {risks.map((risk) => (
                    <div key={risk.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{risk.patientName}</p>
                          <p className="text-sm text-gray-600 mt-1">{risk.symptoms}</p>
                          <p className="text-xs text-gray-500 mt-1">{risk.description}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(risk.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getSeverityColor(risk.severity) as any}>
                            {risk.severity}
                          </Badge>
                          <Badge variant="outline">{risk.status}</Badge>
                        </div>
                      </div>

                      {risk.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <p className="font-medium">Notes:</p>
                          <p className="text-gray-600">{risk.notes}</p>
                        </div>
                      )}

                      {editingRisk === risk.id ? (
                        <div className="mt-3 space-y-2">
                          <Select value={riskStatus} onValueChange={setRiskStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Add notes..."
                            value={riskNotes}
                            onChange={(e) => setRiskNotes(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateRisk(risk.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRisk(null);
                                setRiskStatus('');
                                setRiskNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={() => {
                            setEditingRisk(risk.id);
                            setRiskStatus(risk.status);
                            setRiskNotes(risk.notes || '');
                          }}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Today's Appointments
              </CardTitle>
              <CardDescription>Scheduled patient visits for today</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : todayAppointments.length === 0 ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">No appointments scheduled for today</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/appointments')}
                  >
                    View All Appointments
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600 mt-1">{appointment.type}</p>
                          <p className="text-xs text-gray-500 mt-1">Time: {appointment.time}</p>
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 mt-1">Notes: {appointment.notes}</p>
                          )}
                        </div>
                        <Badge variant={appointment.attended ? 'outline' : 'default'}>
                          {appointment.status}
                        </Badge>
                      </div>
                      {!appointment.attended && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleMarkAttended(appointment.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Attended
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Appointments Link */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">View All Appointments</h3>
                <p className="text-sm text-gray-600">See your complete appointment schedule</p>
              </div>
              <Button onClick={() => navigate('/appointments')}>
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function ProviderDashboard() {
  return <ProviderDashboardContent />;
}
