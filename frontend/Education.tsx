import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BookOpen, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';

interface EducationalContent {
  id: string;
  category: string;
  title: string;
  type: 'do' | 'dont';
  description: string;
  details: string[];
}

function EducationContent() {
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user?.userType === 'provider') {
      navigate('/provider-dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && accessToken) {
      fetchContent();
    }
  }, [user, accessToken]);

  const fetchContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f10e7e14/educational-content`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching educational content:', error);
      toast.error('Failed to load educational content');
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

  const categories = ['all', ...new Set(content.map(c => c.category))];
  const filteredContent = selectedCategory === 'all' 
    ? content 
    : content.filter(c => c.category === selectedCategory);

  const dos = filteredContent.filter(c => c.type === 'do');
  const donts = filteredContent.filter(c => c.type === 'dont');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-pink-600" />
            Pregnancy Education
          </h1>
          <p className="text-gray-600">
            Learn about important do's and don'ts during your pregnancy journey
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading educational content...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Do's Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-green-700">Do's</h2>
              </div>
              <div className="space-y-4">
                {dos.length === 0 ? (
                  <p className="text-gray-500">No recommendations in this category</p>
                ) : (
                  dos.map((item) => (
                    <Card key={item.id} className="border-l-4 border-green-500">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-green-700 border-green-300">
                              {item.category}
                            </Badge>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        </div>
                        <CardDescription className="mt-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {item.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-green-600 mt-1">✓</span>
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Don'ts Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold text-red-700">Don'ts</h2>
              </div>
              <div className="space-y-4">
                {donts.length === 0 ? (
                  <p className="text-gray-500">No warnings in this category</p>
                ) : (
                  donts.map((item) => (
                    <Card key={item.id} className="border-l-4 border-red-500">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-red-700 border-red-300">
                              {item.category}
                            </Badge>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        </div>
                        <CardDescription className="mt-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {item.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-red-600 mt-1">✗</span>
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Important Note */}
        <Card className="mt-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              Important Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-900">
              Every pregnancy is unique. The information provided here is for educational purposes 
              and should not replace professional medical advice. Always consult with your healthcare 
              provider about your specific situation and any concerns you may have during your pregnancy.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function Education() {
  return <EducationContent />;
}
