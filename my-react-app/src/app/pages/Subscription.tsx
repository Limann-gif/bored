import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { Check, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Subscription() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const hasActiveSubscription = user?.subscriptionStatus === 'active';

  useEffect(() => {
    if (hasActiveSubscription) {
      navigate('/activities');
    }
  }, [hasActiveSubscription, navigate]);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update user subscription
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    updateUser({
      subscriptionStatus: 'active',
      subscriptionExpiry: expiryDate,
    });
    
    setIsProcessing(false);
    navigate('/activities');
  };

  const features = [
    'Access to all curated activities',
    'Automatic group matching',
    'Smart location-based grouping',
    'Meeting point suggestions',
    'Unlimited activity selections',
    'New people every time',
    'Cancel anytime',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">
              Get unlimited access to curated social activities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Free Trial */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Try before you commit</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600">/7 days</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-green-600" />
                    <span className="text-sm">1 activity selection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-green-600" />
                    <span className="text-sm">Full features access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-green-600" />
                    <span className="text-sm">No credit card required</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Monthly - Recommended */}
            <Card className="border-4 border-purple-600 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Monthly
                  <Sparkles className="size-5 text-purple-600" />
                </CardTitle>
                <CardDescription>Perfect for regular socializers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="size-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>

            {/* Annual */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Annual</CardTitle>
                <CardDescription>Best value for committed explorers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$249</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <Badge variant="secondary" className="w-fit mt-2">
                  Save $99/year
                </Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="size-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold">Priority matching</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Subscribe Annual
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Sparkles className="size-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">How it works</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Subscribe to unlock the activity marketplace</li>
                    <li>Browse and select activities that match your vibe</li>
                    <li>We automatically match you with 4-6 people nearby</li>
                    <li>Get meeting point details and show up to have fun!</li>
                    <li>Next time, meet a fresh group of people</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500 mt-8">
            This is a demo. Clicking "Subscribe Now" will activate your account without actual payment.
          </p>
        </div>
      </div>
    </div>
  );
}