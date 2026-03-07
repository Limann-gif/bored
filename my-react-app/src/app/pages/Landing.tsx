import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, MapPin, Calendar, ArrowRight, Check, Zap, Heart, Star } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AnimatedBackground } from '../components/AnimatedBackground';

export default function Landing() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/subscription');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/subscription');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: "Curated Activities",
      description: "Weekly rotating experiences from hiking to escape rooms",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Smart Matching",
      description: "Meet new people every time, never the same group twice",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Groups of 4-6 people within your area for easy meetups",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Sparkles,
      title: "Zero Planning",
      description: "We handle logistics, you just show up and have fun",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Activities" },
    { value: "50K+", label: "Connections Made" },
    { value: "4.9★", label: "User Rating" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Manager",
      content: "Finally stopped staying home every weekend! Met amazing people.",
      image: "https://images.unsplash.com/photo-1758272133786-ee98adcc6837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwZnJpZW5kcyUyMGdyb3VwJTIwbGF1Z2hpbmclMjB0b2dldGhlcnxlbnwxfHx8fDE3NzI5MDQzMTd8MA&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      name: "Marcus Johnson",
      role: "Software Engineer",
      content: "No more awkward planning. Just pick an activity and go!",
      image: "https://images.unsplash.com/photo-1768776179834-93e6cafc6d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBlbmpveWluZyUyMG91dGRvb3IlMjBhY3Rpdml0eSUyMHNvY2lhbHxlbnwxfHx8fDE3NzI5MDQzMTh8MA&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      name: "Emma Rodriguez",
      role: "Designer",
      content: "Best decision ever! Every week is a new adventure with new friends.",
      image: "https://images.unsplash.com/photo-1758524945427-5eb9cb2b8cd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlb3BsZSUyMGhhdmluZyUyMGZ1biUyMHRvZ2V0aGVyfGVufDF8fHx8MTc3MjkwNDMxOHww&ixlib=rb-4.1.0&q=80&w=400"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="size-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bored!
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="outline" onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Sign In
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
              <Zap className="size-3 mr-1" />
              No more boring weekends!
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Stop Planning.
              </span>
              <br />
              <span className="text-gray-900">Start Living.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We auto-match you with 4-6 awesome people for curated activities. 
              No group chats. No flaky friends. Just show up and make memories.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started Free
                <ArrowRight className="size-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758272133786-ee98adcc6837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwZnJpZW5kcyUyMGdyb3VwJTIwbGF1Z2hpbmclMjB0b2dldGhlcnxlbnwxfHx8fDE3NzI5MDQzMTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Friends enjoying activities together"
                className="w-full h-[600px] object-cover"
              />
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="size-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Match Found!</div>
                    <div className="text-sm text-gray-600">5 people nearby</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Calendar className="size-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">This Saturday</div>
                    <div className="text-sm text-gray-600">Escape Room @ 7PM</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-white/50 backdrop-blur-sm py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
              Features
            </Badge>
            <h2 className="text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Never Be Bored</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've automated the entire social planning experience so you can focus on having fun
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-purple-300 transition-all hover:shadow-xl group">
                  <CardHeader>
                    <div className={`size-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="size-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-pink-100 text-pink-700 hover:bg-pink-100">
              Simple Process
            </Badge>
            <h2 className="text-5xl font-bold mb-4">
              From Bored to Booked in
              <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent"> 3 Easy Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Pick Your Vibe",
                description: "Browse curated activities and select what excites you this week"
              },
              {
                step: "02",
                title: "Get Matched",
                description: "Our algorithm matches you with 4-6 people nearby who chose the same activity"
              },
              {
                step: "03",
                title: "Show Up & Connect",
                description: "Receive meeting details and just show up. We handle the rest!"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-purple-100 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-12 top-1/2 -translate-y-1/2 size-8 text-purple-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 bg-gradient-to-br from-purple-50 to-pink-50 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
              <Star className="size-3 mr-1" />
              Testimonials
            </Badge>
            <h2 className="text-5xl font-bold mb-4">
              Loved by Thousands of
              <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent"> Happy Explorers</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-md mx-auto shadow-2xl border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
                <CardDescription className="text-base">
                  Join thousands of people making real connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Alex Chen"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-center text-sm text-gray-500">
                    ✨ Demo app - any email/password works for login
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Stop Scrolling. Start Socializing.
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join Bored! today and say goodbye to boring weekends forever
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl"
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Free Trial
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-6" />
              <span className="text-xl font-bold">Bored!</span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2026 Bored! All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}