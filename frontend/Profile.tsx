import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { User, Activity, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

function ProfileContent() {
  const { user, accessToken, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      setName(user.name);
      // Additional fields would come from profile data
    }
  }, [user, loading, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updates: any = { name };
      
      if (user?.userType === 'patient' && dueDate) {
        updates.dueDate = dueDate;
      }
      
      if (user?.userType === 'provider' && specialization) {
        updates.specialization = specialization;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setEditing(false);
        await refreshProfile();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <User className="h-8 w-8 text-pink-600" />
            My Profile
          </h1>
          <p className="text-gray-600">View and manage your account information</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your MekaCare account details</CardDescription>
              </div>
              <Badge variant={user.userType === 'patient' ? 'default' : 'secondary'}>
                {user.userType === 'patient' ? 'Patient' : 'Healthcare Provider'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600">Full Name</Label>
                  <p className="text-lg font-medium">{user.name}</p>
                </div>

                <Separator />

                <div>
                  <Label className="text-gray-600">Email Address</Label>
                  <p className="text-lg">{user.email}</p>
                </div>

                <Separator />

                <div>
                  <Label className="text-gray-600">Account Type</Label>
                  <p className="text-lg capitalize">{user.userType}</p>
                </div>

                {user.userType === 'patient' && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-gray-600">Due Date</Label>
                      <p className="text-lg">
                        {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </>
                )}

                {user.userType === 'provider' && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-gray-600">Specialization</Label>
                      <p className="text-lg">{specialization || 'Not set'}</p>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <Button onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {user.userType === 'patient' && (
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                )}

                {user.userType === 'provider' && (
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization (Optional)</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g., Obstetrician, Midwife, General Practitioner"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={updating}>
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setName(user.name);
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>Your MekaCare usage overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member since</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account status</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Platform Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900">
              MekaCare is designed as a prototype platform for managing pregnancy care. 
              This platform should complement, not replace, regular prenatal care with your 
              healthcare provider. Always seek professional medical advice for any health concerns.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function Profile() {
  return <ProfileContent />;
}
