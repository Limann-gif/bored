import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Calendar, CheckCircle, ChevronRight, Headphones, MapPin, Search, Sparkles, Star, Users, Wallet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Activity } from '../types';
import './Landing.css';

const photo = (id: string, width = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const hero = '/boredballoon-sharp.png';
const people = [photo('photo-1500648767791-00dcc994a43e', 700), photo('photo-1524504388940-b1c1722653e1', 700), photo('photo-1500648767791-00dcc994a43e', 700), photo('photo-1534528741775-53994a69daeb', 700)];
const faqs = [
  ['What does Bored! offer?', 'Discover activities near you, meet new people, or plan an outing with your own friends. Browse an experience to see its location, date, price, and available spots.'],
  ['How do I get started booking an activity?', 'Create an account, choose an activity, and follow the booking steps. You can join a group or book with your friends.'],
  ['Can I book for my friends?', 'Yes! Choose Bored! for Friends in the activities page to invite your crew or surprise them with a booking.'],
  ['Where can I find my booking details?', 'Open My Groups after booking to find your activity and group details.'],
  ['How do I choose the right activity?', 'Filter by category, location, or budget, then open an activity to learn more before you book.'],
  ['How do I pay for my booking?', 'Follow the payment steps shown during booking. For a friends outing, you can pay for everyone or invite friends to pay their share.'],
];
const testimonials = [
  { name: 'Alex', image: '/boredimage2.jpg', quote: 'A weekend outside, a new experience, and a few new friends. That’s my kind of plan.' },
  { name: 'Maya', image: '/boredimage3.jpg', quote: 'Picking something fun together is the best part. There’s always another adventure to look forward to.' },
  { name: 'Jordan', image: '/boredimage4.jpg', quote: 'Less time deciding what to do, more time making memories with the people around me.' },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 0);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const { activities, activitiesLoading, activitiesError } = useApp();
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [filters, setFilters] = useState({ location: '', budget: '', date: '' });
  const [testimonial, setTestimonial] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [signupMode, setSignupMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const categories = ['All', ...new Set(activities.map(a => a.category).filter(Boolean))];
  const locations = [...new Set(activities.map(a => a.location).filter(Boolean))];
  const filtered = activities.filter(a => (category === 'All' || a.category === category) && (!filters.location || a.location === filters.location) && (!filters.budget || a.price <= Number(filters.budget)) && (!filters.date || (!Number.isNaN(a.activityDate.getTime()) && a.activityDate.toISOString().slice(0, 10) === filters.date)));
  const hasFilters = category !== 'All' || Boolean(filters.location || filters.budget || filters.date);
  const cards = hasFilters
    ? filtered
    : filtered.length
      ? Array.from({ length: Math.max(8, filtered.length) }, (_, i) => filtered[i % filtered.length]).slice(0, 8)
      : [];
  const popular = activities.length ? Array.from({ length: 4 }, (_, i) => activities[i % activities.length]) : [];
  const start = () => isAuthenticated ? navigate('/activities') : setAuthOpen(true);
  const openActivity = (activity: Activity) => isAuthenticated ? navigate(`/activity/${activity.id}`) : setAuthOpen(true);
  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { if (signupMode) await signup(name, email, password); else await login(email, password); navigate('/activities'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  const brand = <><Sparkles aria-hidden="true" /><span>Bored!</span></>;

  return <div className="bored-home">
    <header className="travel-hero" style={{ backgroundImage: `linear-gradient(180deg,rgba(0,31,78,.42),rgba(0,0,0,.04) 45%,rgba(0,0,0,.55)),url(${hero})` }}>
      <nav className={`travel-nav home-container${scrolled ? ' is-scrolled' : ''}`} aria-label="Main navigation">
        <a className="travel-brand" href="/">{brand}</a>
        <div className="nav-links"><a href="#explore">Activities</a><a href="#about">About Us</a><a href="#testimonials">Testimonials</a><a href="#faq">FAQs</a></div>
        <button className="nav-signup" onClick={start}>{isAuthenticated ? 'Explore' : 'Sign Up'}</button>
      </nav>
      <div className="home-container hero-content"><h1>Unlock Your<br />Next Adventure<br />With Us!!!</h1><p>Discover something new, one adventure at a time.<br />Life is short. Make a plan.</p><button className="orange-button" onClick={start}>GET STARTED <ArrowRight size={20} /></button></div>
      <div className="home-container popular-section"><div className="popular-title"><h2>Popular Activities</h2><span /></div><div className="popular-strip">
        {popular.map((a, i) => <button key={`${a.id}-${i}`} className="popular-card" onClick={() => openActivity(a)}><ImageWithFallback src={a.image} alt={a.name} /><span>{a.name}</span></button>)}
        {activitiesLoading && <p>Loading activities…</p>}
      </div></div>
    </header>

    <main>
      <div className="home-container"><section className="travel-stats" aria-label="Sample statistics"><div><strong>10</strong><span>Years Of<br />Experience</span></div><div><strong>2K+</strong><span>Best<br />Destination</span></div><div><strong>10K+</strong><span>Happy<br />Customer</span></div><div><strong>4.8</strong><span>Overall<br />Rating</span></div></section></div>
      <section id="explore" className="home-container explore-section"><div className="section-intro"><span className="eyebrow">EXPLORE NOW</span><h2>Find Your Next Adventure</h2><p>Your next great memory is closer than you think.</p></div>
        <form className="travel-search" onSubmit={e => { e.preventDefault(); setFilters({ location, budget, date }); }}>
          <label><MapPin size={17} /><select aria-label="Location" value={location} onChange={e => setLocation(e.target.value)}><option value="">Location</option>{locations.map(l => <option key={l}>{l}</option>)}</select></label>
          <label><Wallet size={17} /><select aria-label="Budget" value={budget} onChange={e => setBudget(e.target.value)}><option value="">Budget</option><option value="100">Up to GH₵100</option><option value="250">Up to GH₵250</option><option value="500">Up to GH₵500</option></select></label>
          <label><Calendar size={17} /><input aria-label="Activity date" type="date" value={date} onChange={e => setDate(e.target.value)} /></label><button className="orange-button" type="submit"><Search size={15} /> Search</button>
        </form>
        <div className="category-pills" aria-label="Activity categories">{categories.map(c => <button key={c} aria-pressed={category === c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <div className="destination-grid">{cards.map((a, i) => <button className="destination-card" key={`${a.id}-${i}`} onClick={() => openActivity(a)}><ImageWithFallback src={a.image} alt={a.name} loading="lazy" /><div className="destination-caption"><div><h3>{a.name}</h3><p><MapPin size={12} />{a.location}</p></div><span>GH₵{a.price}</span></div></button>)}</div>
        {activitiesLoading && <p className="catalog-message">Loading your next adventure…</p>}{activitiesError && <p className="catalog-message" role="alert">{activitiesError}. Please try again when the activity service is available.</p>}{!activitiesLoading && !activitiesError && !cards.length && <p className="catalog-message">No activities found. Try another filter.</p>}
      </section>

      <section id="about" className="home-container choose-section"><div><h2>Why Should You Choose Us</h2><p className="section-description">A little adventure brings people together. Explore new places, meet new faces, and make memories worth keeping.</p><div className="benefit"><span><CheckCircle /></span><div><h3>Easy Online Booking</h3><p>Find your next experience and book it in a few simple steps. Less planning, more living.</p></div></div><div className="benefit"><span><MapPin /></span><div><h3>Experiences Near You</h3><p>Discover activities already curated for your area, from laid-back outings to something adventurous.</p></div></div><div className="benefit"><span><Users /></span><div><h3>Better Together</h3><p>Meet a new group or bring your own crew. Make it a surprise, or invite friends to split the cost.</p></div></div></div><div className="choose-images"><img className="choose-main" src="/choose-friends.png" alt="Friends smiling together for a group selfie" loading="lazy" /><img className="choose-small" src="/boredimage1.jpg" alt="Friends jumping together on the beach" loading="lazy" /></div></section>

      <section id="testimonials" className="home-container testimonial-section"><img className="testimonial-photo" src={testimonials[testimonial].image} alt="Bored! community enjoying an outing together" loading="lazy" /><div><span className="eyebrow">TESTIMONIAL</span><h2>Real Adventures From<br />Our Bored! Community</h2><p className="testimonial-quote">“{testimonials[testimonial].quote}”</p><p className="sample-label">Sample community story · {testimonials[testimonial].name}</p><div className="review-stars" aria-label="Five stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} fill="currentColor" size={22} />)}</div><div className="testimonial-selector">{testimonials.map((t, i) => <button key={t.name} className={testimonial === i ? 'selected' : ''} aria-label={`Show ${t.name}'s sample story`} aria-pressed={testimonial === i} onClick={() => setTestimonial(i)}><img src={t.image} alt="" /></button>)}<button className="next-story" aria-label="Next story" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ChevronRight /></button></div></div></section>

      <section id="faq" className="home-container faq-section"><h2>Frequently Asked Questions</h2><div className="faq-columns"><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div><div className="question-form"><h3>Do You Have Any Specific Question?</h3><p>Find answers to your booking questions and get ready for your next outing.</p><form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); window.location.href = `mailto:?subject=${encodeURIComponent('Bored! booking question')}&body=${encodeURIComponent(`Reply to: ${form.get('email')}\n\n${form.get('question')}`)}`; }}><input name="email" type="email" placeholder="Enter Your Email" aria-label="Your email" required /><textarea name="question" placeholder="Write Your Question Please" aria-label="Your question" required /><button className="orange-button" type="submit">Prepare email</button><small>Opens your email app. Choose the Bored! support recipient before sending.</small></form></div></div></section>

      <section className="journey-section"><div className="home-container journey-inner"><img src="/boredimage5.jpg" alt="Friends making candles together" loading="lazy" /><div><h2>Best Way To Start Your<br />Next Adventure!!!</h2><p>Explore exciting experiences with great company.<br />Life is brief. Make the most of your next weekend.</p><button className="orange-button" onClick={start}>GET STARTED <ArrowRight size={21} /></button></div></div></section>
    </main>
    <footer className="home-container travel-footer"><div className="footer-columns"><div><a className="travel-brand" href="/">{brand}</a><p>Discover something new, one adventure at a time.<br />Life is short. Make a plan.</p><button className="orange-button" onClick={start}>Join Bored! <ArrowRight size={17} /></button></div><div><h3>Quick Menu</h3><a href="#">Home</a><a href="#explore">Activities</a><a href="#about">About Us</a><a href="#testimonials">Testimonials</a></div><div><h3>Your Adventure</h3><button onClick={start}>Find an activity</button><button onClick={start}>Bring your friends</button><button onClick={() => isAuthenticated ? navigate('/my-groups') : setAuthOpen(true)}>My Groups</button><a href="#faq">Booking FAQs</a></div><div><h3>Let’s Connect</h3><p>Good experiences.<br />Great company.</p><a href="#faq"><Headphones size={16} /> Ask a question</a></div></div><div className="footer-copyright">© 2026 Bored! All rights reserved.</div></footer>
    {authOpen && <div className="home-auth-overlay" onClick={() => setAuthOpen(false)}><section className="home-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={e => e.stopPropagation()}><button className="auth-close" aria-label="Close" onClick={() => setAuthOpen(false)}><X /></button><div className="travel-brand">{brand}</div><h2 id="auth-title">{signupMode ? 'Your next adventure starts here.' : 'Welcome back.'}</h2><form onSubmit={submitAuth}>{signupMode && <label>Name<input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" /></label>}<label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={signupMode ? 'new-password' : 'current-password'} /></label>{error && <p role="alert">{error}</p>}<button className="orange-button" disabled={busy}>{busy ? 'Please wait…' : signupMode ? 'Create Account' : 'Sign In'}</button></form><button className="auth-switch" onClick={() => { setSignupMode(!signupMode); setError(''); }}>{signupMode ? 'Already have an account? Sign in' : 'New to Bored!? Create an account'}</button></section></div>}
  </div>;
}
