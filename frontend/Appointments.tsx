import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Calendar, Activity, Plus, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  attended: boolean;
  notes: string;
  patientName?: string;
  providerName?: string;
}

interface Provider {
  userId: string;
  name: string;
  specialization: string;
}

function AppointmentsContent() {
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [selectedProvider, setSelectedProvider] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);

  const fetchData = async () => {
    try {
      const appointmentsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/appointments`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(data.appointments);
      }

      // Fetch providers if user is a patient
      if (user?.userType === 'patient') {
        const providersRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/providers`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (providersRes.ok) {
          const data = await providersRes.json();
          setProviders(data.providers);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoadingData(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            providerId: selectedProvider,
            date: appointmentDate,
            time: appointmentTime,
            type: appointmentType,
            notes: appointmentNotes,
          }),
        }
      );

      if (response.ok) {
        toast.success('Appointment booked successfully!');
        setIsDialogOpen(false);
        setSelectedProvider('');
        setAppointmentDate('');
        setAppointmentTime('');
        setAppointmentType('');
        setAppointmentNotes('');
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setSubmitting(false);
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
    .filter(a => new Date(a.date) >= new Date() && !a.attended)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(a => new Date(a.date) < new Date() || a.attended)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600">
              {user.userType === 'patient' 
                ? 'Manage your antenatal care appointments'
                : 'View and manage patient appointments'}
            </p>
          </div>
          {user.userType === 'patient' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule your antenatal care appointment with a healthcare provider
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Healthcare Provider *</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.userId} value={provider.userId}>
                            {provider.name}
                            {provider.specialization && ` - ${provider.specialization}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type *</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial-consultation">Initial Consultation</SelectItem>
                        <SelectItem value="routine-checkup">Routine Checkup</SelectItem>
                        <SelectItem value="ultrasound">Ultrasound</SelectItem>
                        <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                        <SelectItem value="lab-work">Lab Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific concerns or information for the provider..."
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'Booking...' : 'Book Appointment'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Upcoming Appointments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              {upcomingAppointments.length} scheduled appointment{upcomingAppointments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming appointments</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{appointment.type}</h3>
                          <Badge variant="default">{appointment.status}</Badge>
                        </div>
                        {user.userType === 'patient' ? (
                          <p className="text-sm text-gray-600 mb-1">
                            Provider: {appointment.providerName}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 mb-1">
                            Patient: {appointment.patientName}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })} at {appointment.time}
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Past Appointments
            </CardTitle>
            <CardDescription>
              {pastAppointments.length} completed appointment{pastAppointments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : pastAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No past appointments</p>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{appointment.type}</h3>
                          <Badge variant={appointment.attended ? 'outline' : 'secondary'}>
                            {appointment.attended ? 'Attended' : appointment.status}
                          </Badge>
                        </div>
                        {user.userType === 'patient' ? (
                          <p className="text-sm text-gray-600 mb-1">
                            Provider: {appointment.providerName}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 mb-1">
                            Patient: {appointment.patientName}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function Appointments() {
  return <AppointmentsContent />;
}
