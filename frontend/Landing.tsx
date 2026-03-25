import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, Calendar, BookOpen, Shield, UserCheck, Activity } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-600" />
            <h1 className="text-2xl font-bold text-pink-600">MekaCare</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Your Pregnancy Journey,<br />
          <span className="text-pink-600">Supported Every Step</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          MekaCare connects pregnant women with healthcare providers, offers educational resources, 
          and helps manage your prenatal care all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Sign Up as Patient
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Sign Up as Provider
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Risk Monitoring</CardTitle>
              <CardDescription>
                Report symptoms and risks instantly, get connected with healthcare providers immediately
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <UserCheck className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Provider Matching</CardTitle>
              <CardDescription>
                Automatically matched with available healthcare providers based on your needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Appointment Booking</CardTitle>
              <CardDescription>
                Schedule and manage antenatal appointments with ease, track attendance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Educational Resources</CardTitle>
              <CardDescription>
                Access comprehensive guides on pregnancy do's and don'ts, nutrition, and wellness
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Health Tracking</CardTitle>
              <CardDescription>
                Monitor your pregnancy progress and maintain a record of all health concerns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-pink-600 mb-2" />
              <CardTitle>Personalized Care</CardTitle>
              <CardDescription>
                Receive personalized recommendations and care based on your unique pregnancy journey
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of mothers and healthcare providers using MekaCare
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 MekaCare. Supporting healthy pregnancies worldwide.</p>
          <p className="text-sm mt-2">
            Note: This is a prototype platform. Always consult with healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
