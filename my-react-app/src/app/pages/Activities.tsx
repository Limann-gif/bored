import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { ActivityCard } from '../components/ActivityCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Filter } from 'lucide-react';

export default function Activities() {
  const { user } = useAuth();
  const { activities } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  // Redirect if not subscribed
  if (user?.subscriptionStatus !== 'active') {
    navigate('/subscription');
    return null;
  }

  // Extract unique categories and vibes
  const categories = useMemo(() => {
    const cats = new Set(activities.map(a => a.category));
    return Array.from(cats);
  }, [activities]);

  const allVibes = useMemo(() => {
    const vibes = new Set(activities.flatMap(a => a.vibes));
    return Array.from(vibes);
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || activity.category === selectedCategory;
      const matchesVibes = selectedVibes.length === 0 || 
                          selectedVibes.some(vibe => activity.vibes.includes(vibe));
      
      return matchesSearch && matchesCategory && matchesVibes;
    });
  }, [activities, searchTerm, selectedCategory, selectedVibes]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) 
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Curated Activities</h1>
          <p className="text-lg text-gray-600">
            Pick an activity, we'll find your crew and handle the rest
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-5 text-gray-600" />
            <span className="text-sm font-medium">Category:</span>
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Vibes Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Vibes:</span>
            {allVibes.map(vibe => (
              <Badge
                key={vibe}
                variant={selectedVibes.includes(vibe) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleVibe(vibe)}
              >
                {vibe}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
        </p>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600">No activities found matching your criteria</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
                setSelectedVibes([]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
