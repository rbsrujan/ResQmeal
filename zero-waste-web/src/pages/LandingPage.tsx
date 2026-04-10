import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, 
  Route as RouteIcon, 
  ShieldCheck, 
  Utensils, 
  Building2, 
  Home, 
  PartyPopper, 
  CheckCircle2, 
  Navigation, 
  Activity, 
  ChevronRight, 
  Gift, 
  Banknote, 
  Ticket, 
  Landmark, 
  Warehouse, 
  Lock, 
  LocateFixed, 
  EyeOff,
  Clock,
  Truck
} from 'lucide-react';
import MapContainer from '../components/MapContainer';

export default function LandingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [stats, setStats] = useState({ meals: 0, people: 0, co2: 0, deliveries: 0 });

  const getDashboardPath = () => {
    if (profile?.role === 'volunteer') return '/dashboard/volunteer';
    if (profile?.role === 'receiver') return '/dashboard/receiver';
    return '/dashboard/donor';
  };

  useEffect(() => {
    // Animate stats (count up effect)
    const duration = 2500;
    const fps = 60;
    let frame = 0;
    const totalFrames = (duration / 1000) * fps;
    const interval = setInterval(() => {
      frame++;
      setStats({
        meals: Math.floor((125430 / totalFrames) * frame),
        people: Math.floor((45200 / totalFrames) * frame),
        co2: Math.floor((32000 / totalFrames) * frame),
        deliveries: Math.floor((142 / totalFrames) * frame)
      });
      if (frame === totalFrames) clearInterval(interval);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, []);

  const donorTypes = [
    { id: 'restaurant', label: 'Restaurant / Hotel', icon: Utensils, desc: 'Donate daily surplus meals or buffets.' },
    { id: 'college', label: 'Hostel / Mess', icon: Building2, desc: 'Batch donations from institutional dining.' },
    { id: 'household', label: 'Household', icon: Home, desc: 'Fresh homemade surplus in smaller quantities.' },
    { id: 'event', label: 'Event / Function', icon: PartyPopper, desc: 'Bulk catering leftovers from gatherings.' },
  ];

  const handleDonorSelect = (type: string) => {
    setIsDonorModalOpen(false);
    navigate(`/donor/upload?type=${type}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-[#F8FAFC] font-inter">
      
      {/* 🚀 PREMIUM NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Leaf size={24} />
            </div>
            <span className="text-xl font-black tracking-tight">ZeroWaste <span className="text-emerald-500">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/impact" className="text-sm font-bold text-slate-400 hover:text-white transition">Impact</Link>
            <Link to="/about" className="text-sm font-bold text-slate-400 hover:text-white transition">How it Works</Link>
            <div className="w-px h-4 bg-white/10" />
            
            {user ? (
              // LOGGED IN STATE
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#94A3B8', fontSize: 13 }}>
                  Hi, {profile?.full_name?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  style={{
                    background: '#16A34A',
                    border: 'none',
                    color: '#fff',
                    padding: '9px 22px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  My Dashboard
                </button>
              </div>
            ) : (
              // LOGGED OUT STATE
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    padding: '9px 22px',
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}>
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: '#16A34A',
                    border: 'none',
                    color: '#fff',
                    padding: '9px 22px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button className="md:hidden p-2 text-slate-400">
            <Activity size={24} />
          </button>
        </div>
      </nav>
      
      {/* DONOR MODAL */}
      {isDonorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl w-full max-w-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-6 md:p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsDonorModalOpen(false)} 
              className="absolute top-6 right-6 text-[#64748B] hover:text-[#F8FAFC] p-2 hover:bg-[#334155] rounded-full transition"
            >
              ✕
            </button>
            <h2 className="text-3xl font-bold mb-2 text-[#F8FAFC]">Who are you donating as?</h2>
            <p className="text-[#94A3B8] mb-8">Select your profile so we can tailor the requirements for you.</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {donorTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button 
                    key={type.id}
                    onClick={() => handleDonorSelect(type.id)}
                    className="flex text-left items-start gap-4 p-5 rounded-2xl border border-[#334155] hover:border-[#16A34A] bg-[#0F172A] hover:bg-[#14532D]/30 transition group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1E293B] group-hover:bg-[#16A34A] flex items-center justify-center text-[#16A34A] group-hover:text-[#FFFFFF] transition shrink-0 shadow-inner">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#F8FAFC] text-lg mb-1">{type.label}</h3>
                      <p className="text-[#94A3B8] text-sm leading-snug">{type.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 HERO SECTION */}
      <section className="relative py-24 px-4 pt-40 w-full flex flex-col items-center justify-center text-center overflow-hidden border-b border-[#334155]">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#16A34A] opacity-[0.05] blur-[100px] rounded-full point-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-[#F8FAFC] leading-tight drop-shadow-sm">
            Turn <span className="bg-gradient-to-r from-[#4ADE80] to-[#16A34A] bg-clip-text text-transparent">Surplus</span> Into Hope
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-12 max-w-3xl mx-auto text-[#94A3B8] leading-relaxed">
            Every meal you save reaches someone in need — powered by AI, driven by humanity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-6">
            <button 
              onClick={() => {
                if (user && profile?.role === 'donor') {
                  navigate('/donor/upload');
                } else if (user && profile?.role !== 'donor') {
                  // Logged in but wrong role — go to their dashboard
                  navigate(getDashboardPath());
                } else {
                  // Not logged in — go to login
                  navigate('/login');
                }
              }}
              className="w-full sm:w-auto px-10 py-4 bg-[#16A34A] text-[#FFFFFF] font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:bg-[#14532D] transition-all hover:scale-105"
            >
              Donate Food Now
            </button>
            <button 
              onClick={() => {
                if (user) {
                  navigate(getDashboardPath());
                } else {
                  navigate('/login');
                }
              }}
              className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-[#334155] text-[#F8FAFC] hover:border-[#F8FAFC] font-bold text-lg rounded-xl transition-all hover:scale-105"
            >
              Register as Receiver
            </button>
          </div>
          <p className="text-sm font-semibold text-[#16A34A] flex items-center justify-center gap-2 italic">
            <Leaf size={16} /> "One donation today can feed a life tonight."
          </p>
        </div>
      </section>

      {/* ⚙️ HOW IT WORKS */}
      <section className="py-24 px-4 bg-[#0F172A] relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#F8FAFC]">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1E293B] p-8 rounded-[20px] border border-[#334155] shadow-lg flex flex-col items-center text-center group hover:-translate-y-2 transition duration-300">
              <div className="w-20 h-20 bg-[#0F172A] rounded-2xl flex items-center justify-center text-[#16A34A] mb-8 shadow-inner border border-[#334155] group-hover:bg-[#16A34A] group-hover:text-[#FFFFFF] transition-colors">
                <Leaf size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#F8FAFC]">1. Upload Food</h3>
              <p className="text-[#94A3B8] text-lg leading-relaxed">Add food details using image or voice in seconds.</p>
            </div>
            <div className="bg-[#1E293B] p-8 rounded-[20px] border border-[#334155] shadow-lg flex flex-col items-center text-center group hover:-translate-y-2 transition duration-300 relative">
              <div className="hidden md:block absolute top-1/2 -left-8 w-16 h-1 border-t-2 border-dashed border-[#334155]" />
              <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-1 border-t-2 border-dashed border-[#334155]" />
              <div className="w-20 h-20 bg-[#0F172A] rounded-2xl flex items-center justify-center text-[#16A34A] mb-8 shadow-inner border border-[#334155] group-hover:bg-[#16A34A] group-hover:text-[#FFFFFF] transition-colors">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#F8FAFC]">2. AI Verifies</h3>
              <p className="text-[#94A3B8] text-lg leading-relaxed">Our system checks food safety using AI and freshness indicators.</p>
            </div>
            <div className="bg-[#1E293B] p-8 rounded-[20px] border border-[#334155] shadow-lg flex flex-col items-center text-center group hover:-translate-y-2 transition duration-300">
              <div className="w-20 h-20 bg-[#0F172A] rounded-2xl flex items-center justify-center text-[#16A34A] mb-8 shadow-inner border border-[#334155] group-hover:bg-[#16A34A] group-hover:text-[#FFFFFF] transition-colors">
                <RouteIcon size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#F8FAFC]">3. Smart Delivery</h3>
              <p className="text-[#94A3B8] text-lg leading-relaxed">Food is routed in real-time to the best receiver or community point.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🧠 UNIQUE FEATURES (USP) */}
      <section className="py-24 px-4 bg-[#1E293B] border-y border-[#334155]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#F8FAFC]">What Makes ZeroWaste AI Different?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0F172A] p-8 rounded-3xl border border-[#334155] flex items-start gap-6 hover:shadow-[0_8px_30px_rgba(22,163,74,0.1)] transition duration-300">
              <div className="p-4 bg-[#14532D] text-[#86EFAC] rounded-2xl shrink-0"><CheckCircle2 size={32} /></div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#F8FAFC]">AI Food Safety Verification</h3>
                <p className="text-[#94A3B8]">Computer vision instantly analyzes colors and textures to flag spoilage or mold before dispatch.</p>
              </div>
            </div>
            <div className="bg-[#0F172A] p-8 rounded-3xl border border-[#334155] flex items-start gap-6 hover:shadow-[0_8px_30px_rgba(22,163,74,0.1)] transition duration-300">
              <div className="p-4 bg-[#1E3A8A] text-[#93C5FD] rounded-2xl shrink-0"><Activity size={32} /></div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#F8FAFC]">Multi-Tier Redistribution</h3>
                <p className="text-[#94A3B8]">Graded systematically: Perfect for Human consumption, marginal for Animals, or routed directly to Compost.</p>
              </div>
            </div>
            <div className="bg-[#0F172A] p-8 rounded-3xl border border-[#334155] flex items-start gap-6 hover:shadow-[0_8px_30px_rgba(22,163,74,0.1)] transition duration-300">
              <div className="p-4 bg-[#7F1D1D] text-[#FCA5A5] rounded-2xl shrink-0"><Lock size={32} /></div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#F8FAFC]">Tamper-Proof System</h3>
                <p className="text-[#94A3B8]">Strictly enforced zero-override protocols tied with geolocation ensures absolute accountability in transit.</p>
              </div>
            </div>
            <div className="bg-[#0F172A] p-8 rounded-3xl border border-[#334155] flex items-start gap-6 hover:shadow-[0_8px_30px_rgba(22,163,74,0.1)] transition duration-300">
              <div className="p-4 bg-[#713F12] text-[#FDBA74] rounded-2xl shrink-0"><Navigation size={32} /></div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-[#F8FAFC]">Real-Time Smart Matching</h3>
                <p className="text-[#94A3B8]">Geospatial algorithms match capacities instantly avoiding long transit times or facility flooding.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 IMPACT DASHBOARD */}
      <section className="py-24 px-4 bg-[#0F172A] relative border-b border-[#334155]">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-[#1E293B] rounded-3xl border border-[#16A34A] shadow-[0_0_30px_rgba(22,163,74,0.1)] p-12 text-center relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-10 text-[#F8FAFC]">Active Live Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-[#334155]">
              <div className="flex flex-col">
                <div className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-3 font-mono">{stats.meals.toLocaleString()}</div>
                <div className="text-[#86EFAC] tracking-widest text-sm uppercase font-bold">Meals Saved</div>
              </div>
              <div className="flex flex-col">
                <div className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-3 font-mono">{stats.people.toLocaleString()}</div>
                <div className="text-[#86EFAC] tracking-widest text-sm uppercase font-bold">People Fed</div>
              </div>
              <div className="flex flex-col">
                <div className="text-4xl md:text-5xl font-black text-[#3B82F6] mb-3 font-mono">{stats.co2.toLocaleString()}kg</div>
                <div className="text-[#93C5FD] tracking-widest text-sm uppercase font-bold">CO₂ Reduced</div>
              </div>
              <div className="flex flex-col">
                <div className="text-4xl md:text-5xl font-black text-[#F97316] mb-3 font-mono">{stats.deliveries}</div>
                <div className="text-[#FDBA74] tracking-widest text-sm uppercase font-bold">Active Deliveries Today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗺️ LIVE MAP SECTION */}
      <section className="py-24 px-4 bg-[#0F172A] border-b border-[#334155]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#F8FAFC]">Live Food Redistribution Network</h2>
          <div className="w-full h-[500px] bg-[#1E293B] rounded-[32px] border border-[#334155] shadow-lg relative overflow-hidden">
            <MapContainer 
              zoom={11}
              markers={[
                { id: 'l1', position: { lat: 12.9716, lng: 77.5946 }, type: 'donor', title: 'Hotel Grand' },
                { id: 'l2', position: { lat: 12.9350, lng: 77.6244 }, type: 'receiver', title: 'Mercy NGO' },
                { id: 'l3', position: { lat: 12.9550, lng: 77.6000 }, type: 'point', title: 'Community Fridge' },
                { id: 'l4', position: { lat: 12.9450, lng: 77.6100 }, type: 'agent', title: 'Active Delivery' }
              ]}
            />
          </div>
        </div>
      </section>

      {/* 🎬 DEMO / VISUAL FLOW */}
      <section className="py-24 px-4 bg-[#1E293B] border-b border-[#334155] overflow-x-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 font-bold text-lg md:text-xl text-[#F8FAFC]">
            <div className="flex items-center gap-3 bg-[#0F172A] px-6 py-4 rounded-2xl border border-[#334155] shadow-lg"><Leaf className="text-[#16A34A]"/> Upload</div>
            <ChevronRight className="hidden md:block text-[#64748B] opacity-50" size={32} />
            <div className="flex items-center gap-3 bg-[#0F172A] px-6 py-4 rounded-2xl border border-[#334155] shadow-lg"><ShieldCheck className="text-[#3B82F6]"/> AI Scan</div>
            <ChevronRight className="hidden md:block text-[#64748B] opacity-50" size={32} />
            <div className="flex items-center gap-3 bg-[#0F172A] px-6 py-4 rounded-2xl border border-[#334155] shadow-lg"><LocateFixed className="text-[#F97316]"/> Match</div>
            <ChevronRight className="hidden md:block text-[#64748B] opacity-50" size={32} />
            <div className="flex items-center gap-3 bg-[#0F172A] px-6 py-4 rounded-2xl border border-[#334155] shadow-lg"><Truck className="text-[#14532D]"/> Deliver</div>
            <ChevronRight className="hidden md:block text-[#64748B] opacity-50" size={32} />
            <div className="flex items-center gap-3 bg-[#16A34A] px-6 py-4 rounded-2xl shadow-lg border border-[#14532D]"><Activity className="text-white"/> Impact</div>
          </div>
        </div>
      </section>

      {/* 🎁 REWARD SYSTEM SECTION */}
      <section className="py-24 px-4 bg-[#0F172A] border-b border-[#334155]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">Earn While You Give</h2>
            <p className="text-xl text-[#94A3B8] leading-relaxed">
              Every verified donation adds points to your account. Reach milestones and redeem actual rewards while saving the environment.
            </p>
            <div className="flex items-center gap-4 bg-[#1E293B] border border-[#334155] p-6 rounded-2xl w-fit">
              <Gift size={40} className="text-[#F97316]" />
              <div>
                <p className="text-2xl font-black text-[#F8FAFC]">100 Pts</p>
                <p className="text-sm text-[#94A3B8] font-bold uppercase">Average Donation</p>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-[#14532D] text-[#86EFAC] rounded-full flex items-center justify-center"><Banknote /></div>
              <h4 className="font-bold text-lg text-[#F8FAFC]">Fuel Vouchers</h4>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-[#1E3A8A] text-[#93C5FD] rounded-full flex items-center justify-center"><Landmark /></div>
              <h4 className="font-bold text-lg text-[#F8FAFC]">UPI Cashback</h4>
            </div>
            <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl flex flex-col items-center text-center gap-2 sm:col-span-2">
              <div className="w-12 h-12 bg-[#713F12] text-[#FDBA74] rounded-full flex items-center justify-center"><Ticket /></div>
              <h4 className="font-bold text-lg text-[#F8FAFC]">Discount Coupons</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 STORAGE & TRACKING */}
      <section className="py-24 px-4 bg-[#1E293B] border-b border-[#334155]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC]">Smart Storage & Tracking</h2>
            <p className="text-xl text-[#94A3B8] leading-relaxed">
              Real-time thermal tracking guarantees safe hold times. Automated expiry countdowns protect against compromised consumptions inside NGOs and smart lockers.
            </p>
            {/* Small UI Mock */}
            <div className="mt-8 bg-[#0F172A] border border-[#334155] p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <Warehouse className="absolute right-4 bottom-4 text-[#334155] opacity-50" size={100} />
              <div className="relative z-10">
                <p className="text-[#F8FAFC] font-bold mb-4 flex items-center gap-2"><Clock className="text-[#EAB308]" /> Batch: B_8941</p>
                <div className="w-full bg-[#334155] h-3 rounded-full mb-2">
                  <div className="w-1/3 h-full bg-[#16A34A] rounded-full" />
                </div>
                <p className="text-sm font-semibold text-[#86EFAC]">Stored for 20 mins — Safe for 40 mins</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
             <div className="w-full aspect-square bg-[#0F172A] border border-[#334155] rounded-full shadow-[0_0_50px_rgba(22,163,74,0.1)] flex items-center justify-center">
               <ShieldCheck size={120} className="text-[#16A34A]" />
             </div>
          </div>
        </div>
      </section>

      {/* 🏠 COMMUNITY DISTRIBUTION & 🔐 TRUST */}
      <section className="py-24 px-4 bg-[#0F172A] border-b border-[#334155]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Distribution */}
          <div className="bg-[#1E293B] border border-[#334155] p-10 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Reaching Beyond Digital Access</h2>
            <p className="text-[#94A3B8] text-lg mb-8">Food is successfully delivered to verified unbanked localities ensuring maximum impact.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><Home className="text-[#16A34A]"/></div> Community Food Points</li>
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><Building2 className="text-[#16A34A]"/></div> Active NGOs</li>
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><Navigation className="text-[#16A34A]"/></div> Homeless Shelters</li>
            </ul>
          </div>

          {/* Trust */}
          <div className="bg-[#1E293B] border border-[#334155] p-10 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-[#F8FAFC]">Reliable & Tamper-Proof</h2>
            <p className="text-[#94A3B8] text-lg mb-8">Every layer is strictly regulated to assure top-tier hygienic guarantees across transfers.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><CheckCircle2 className="text-[#3B82F6]"/></div> AI-Based Verification</li>
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><EyeOff className="text-[#3B82F6]"/></div> Live Image Capture Only</li>
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><LocateFixed className="text-[#3B82F6]"/></div> Encrypted GPS Tracking</li>
              <li className="flex items-center gap-4 text-[#F8FAFC] font-bold"><div className="p-3 bg-[#0F172A] rounded-xl"><Lock className="text-[#3B82F6]"/></div> No Manual Overrides</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 📢 FINAL CTA SECTION */}
      <section className="py-32 px-4 bg-[#16A34A] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#14532D] opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent to-black/30 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-8 text-[#FFFFFF] drop-shadow-lg">Start Saving Meals Today</h2>
          <p className="text-xl text-green-100 mb-12 font-medium max-w-2xl mx-auto">
            Join the ZeroWaste AI revolution. Help us completely eradicate food waste and bridge the gap to zero hunger.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => setIsDonorModalOpen(true)}
              className="px-10 py-5 bg-[#0F172A] text-[#F8FAFC] font-bold text-xl rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-[#1E293B] hover:-translate-y-1 transition-transform"
            >
              Donate Food Now
            </button>
            <Link 
              to="/receiver/dashboard" 
              className="px-10 py-5 bg-transparent border-2 border-[#FFFFFF] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#16A34A] font-bold text-xl rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all"
            >
              Join as Receiver
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

// Resubmission commit update
