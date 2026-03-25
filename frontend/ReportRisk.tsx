import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

function ReportRiskContent() {
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user?.userType === 'provider') {
      navigate('/provider-dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/risks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ symptoms, severity, description }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Risk reported successfully! A healthcare provider will review it soon.');
        setSymptoms('');
        setSeverity('');
        setDescription('');
        setTimeout(() => navigate('/patient-dashboard'), 1500);
      } else {
        toast.error(data.error || 'Failed to report risk');
      }
    } catch (error) {
      console.error('Error reporting risk:', error);
      toast.error('Failed to report risk');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-2xl">Report a Health Concern</CardTitle>
            </div>
            <CardDescription>
              Flag any symptoms or health risks you're experiencing. A healthcare provider will be automatically 
              assigned to review your concern and provide guidance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms *</Label>
                <Input
                  id="symptoms"
                  placeholder="e.g., Severe headache, nausea, dizziness"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Briefly describe the main symptoms you're experiencing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level *</Label>
                <Select value={severity} onValueChange={setSeverity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor discomfort</SelectItem>
                    <SelectItem value="medium">Medium - Noticeable symptoms</SelectItem>
                    <SelectItem value="high">High - Severe or urgent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  How severe are your symptoms? If urgent, please also contact emergency services.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about your symptoms, when they started, how often they occur, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500">
                  Include when symptoms started, frequency, intensity, and any other relevant information
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Important Emergency Information
                </h4>
                <p className="text-xs text-gray-700">
                  If you are experiencing a medical emergency (severe bleeding, intense abdominal pain, 
                  sudden severe headache, decreased fetal movement, etc.), please call emergency services 
                  immediately or go to the nearest hospital. This platform is for non-emergency concerns.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patient-dashboard')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Common Symptoms to Watch For */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Common Warning Signs During Pregnancy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Vaginal bleeding or fluid leakage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Severe or persistent headaches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Sudden swelling of face, hands, or feet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Decreased fetal movement (after 28 weeks)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Severe abdominal pain or cramping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Persistent nausea and vomiting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Fever over 100.4°F (38°C)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                <span>Vision changes or blurriness</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function ReportRisk() {
  return <ReportRiskContent />;
}
