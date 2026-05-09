import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import {
  Landmark,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CreditCard,
  Lock,
  TrendingUp,
  Smartphone,
  ChevronDown,
  Star,
  Users,
  Banknote,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Play,
} from "lucide-react";

function AnimatedCounter({ end, duration = 2000, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function FloatingParticle({ delay, x, size, duration }: { delay: number; x: number; size: number; duration: number }) {
  return (
    <div
      className="absolute rounded-full bg-[#fbbf24]/20 pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -20,
        animation: `floatUp ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / 30,
          y: (e.clientY - rect.top - rect.height / 2) / 30,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const particles = Array.from({ length: 15 }, (_, i) => ({
    delay: i * 0.5,
    x: Math.random() * 100,
    size: 4 + Math.random() * 12,
    duration: 8 + Math.random() * 8,
  }));

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Floating particles style */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(4px) rotate(-0.5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.15); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.3), 0 0 80px rgba(251, 191, 36, 0.1); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-slide-up { animation: slideInUp 0.8s ease-out forwards; }
        .animate-slide-left { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slide-right { animation: slideInRight 0.8s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
        .animate-float { animation: gentleFloat 6s ease-in-out infinite; }
        .animate-float-delayed { animation: gentleFloat 6s ease-in-out 1s infinite; }
        .animate-float-slow { animation: gentleFloat 8s ease-in-out 2s infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-md shadow-amber-400/25">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">OneUnited</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link to="/login">
              <Button className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full text-sm shadow-md shadow-amber-400/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[#fbbf24]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-indigo-400/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
          {particles.map((p, i) => (
            <FloatingParticle key={i} {...p} />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/50">
                <Zap className="w-4 h-4 text-[#fbbf24]" />
                <span className="text-sm font-semibold text-amber-700">Banking Reimagined</span>
              </div>

              <h1 className="animate-slide-up text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ animationDelay: "0.15s" }}>
                Banking for the{" "}
                <span className="bg-amber-100 text-amber-800 px-2 rounded-lg">Modern Era</span>
              </h1>

              <p className="animate-slide-up text-lg text-slate-500 max-w-lg leading-relaxed" style={{ animationDelay: "0.3s" }}>
                Zero fees, instant transfers, and AI-powered insights. Experience banking that works as fast as you do.
              </p>

              <div className="animate-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: "0.45s" }}>
                <Link to="/login">
                  <Button className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full px-8 py-6 text-base shadow-lg shadow-amber-400/25 transition-all hover:shadow-xl hover:shadow-amber-400/30 hover:scale-105">
                    Open Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full px-8 py-6 text-base transition-all hover:scale-105"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Play className="w-4 h-4 mr-2 text-[#fbbf24]" />
                  Learn More
                </Button>
              </div>

              <div className="animate-slide-up flex items-center gap-6 pt-4" style={{ animationDelay: "0.6s" }}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter end={50} suffix="K+" />
                  </p>
                  <p className="text-xs text-slate-500">Active Users</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter end={2} prefix="$" suffix="B+" />
                  </p>
                  <p className="text-xs text-slate-500">Transactions</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">99.9%</p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>
              </div>
            </div>

            {/* Animated Card Visual */}
            <div className="hidden lg:block relative animate-slide-right" style={{ animationDelay: "0.4s" }}>
              <div
                className="relative w-full max-w-md mx-auto transition-transform duration-300 ease-out"
                style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 0.5}deg) rotateX(${-mousePos.y * 0.5}deg)` }}
              >
                {/* Main Card */}
                <div className="animate-pulse-glow relative bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#fbbf24] flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">OneUnited</span>
                    </div>
                    <CreditCard className="w-6 h-6 text-[#fbbf24]" />
                  </div>
                  <div className="mb-8">
                    <p className="text-xs text-slate-400 mb-1">Total Balance</p>
                    <p className="text-3xl font-bold font-mono text-slate-900">$24,562.80</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Account</p>
                      <p className="text-sm font-mono tracking-wider text-slate-600">**** **** **** 4521</p>
                    </div>
                    <div className="w-12 h-8 bg-amber-100 rounded-md flex items-center justify-center">
                      <div className="w-6 h-4 border border-amber-300 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Floating mini cards */}
                <div className="animate-float absolute -bottom-6 -left-8 bg-white rounded-2xl p-4 border border-slate-200 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">+12.5%</p>
                      <p className="text-xs text-slate-400">This Month</p>
                    </div>
                  </div>
                </div>

                <div className="animate-float-delayed absolute -top-4 -right-4 bg-white rounded-2xl p-3 border border-slate-200 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Transfer Sent</p>
                      <p className="text-xs text-emerald-600">$350.00</p>
                    </div>
                  </div>
                </div>

                <div className="animate-float-slow absolute top-1/2 -right-12 bg-white rounded-xl p-2.5 border border-slate-200 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-slate-600">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16">
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="animate-bounce p-2 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow"
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Trusted By / Logos */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-slate-400 mb-8 font-medium uppercase tracking-wider">Trusted by leading companies</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
            {["Visa", "Mastercard", "Stripe", "Plaid", "FDIC"].map((name) => (
              <div key={name} className="flex items-center gap-2 text-lg font-bold text-slate-600">
                <Shield className="w-5 h-5" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-4">
              <Star className="w-3 h-3" />
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              A complete suite of banking tools designed for modern life.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Transfers",
                description: "Send money in real-time to any account, anywhere in the world.",
                color: "bg-amber-50 text-amber-600",
                borderColor: "border-amber-100 hover:border-amber-300",
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description: "256-bit encryption, biometric auth, and real-time fraud monitoring.",
                color: "bg-emerald-50 text-emerald-600",
                borderColor: "border-emerald-100 hover:border-emerald-300",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Access your accounts from 150+ countries with no foreign fees.",
                color: "bg-indigo-50 text-indigo-600",
                borderColor: "border-indigo-100 hover:border-indigo-300",
              },
              {
                icon: CreditCard,
                title: "Virtual Cards",
                description: "Create unlimited virtual cards for secure online purchases.",
                color: "bg-amber-50 text-amber-600",
                borderColor: "border-amber-100 hover:border-amber-300",
              },
              {
                icon: Lock,
                title: "Smart Savings",
                description: "AI-powered savings goals that adapt to your spending habits.",
                color: "bg-purple-50 text-purple-600",
                borderColor: "border-purple-100 hover:border-purple-300",
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description: "Full banking power in your pocket, available 24/7.",
                color: "bg-rose-50 text-rose-600",
                borderColor: "border-rose-100 hover:border-rose-300",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`group p-6 rounded-2xl bg-white border ${feature.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold mb-4">
              <Activity className="w-3 h-3" />
              By The Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Growing Fast</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Our community of users and transactions keeps growing every day.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Active Users", value: 50000, prefix: "", suffix: "+", color: "text-amber-400" },
              { icon: Banknote, label: "Processed", value: 2000000000, prefix: "$", suffix: "+", color: "text-emerald-400" },
              { icon: ArrowUpRight, label: "Countries", value: 150, prefix: "", suffix: "+", color: "text-indigo-400" },
              { icon: Shield, label: "Uptime", value: 99, prefix: "", suffix: ".9%", color: "text-rose-400" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mb-4`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-2">
                  <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-4">
              <CheckCircle2 className="w-3 h-3" />
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Get started in minutes with our streamlined onboarding.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up with your email and verify your identity in under 2 minutes.",
                icon: Users,
              },
              {
                step: "02",
                title: "Add Funds",
                description: "Deposit money via bank transfer, card, or direct deposit.",
                icon: Banknote,
              },
              {
                step: "03",
                title: "Start Banking",
                description: "Send, receive, and manage your money with zero fees.",
                icon: Zap,
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-lg mb-6 group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <span className="text-2xl font-bold text-[#fbbf24]">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">
              <Star className="w-3 h-3" />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Loved by Users</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Small Business Owner",
                text: "OneUnited has completely transformed how I manage my business finances. The instant transfers are a game changer.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Software Engineer",
                text: "Finally a bank that gets it. Clean interface, zero fees, and the security features give me peace of mind.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Freelance Designer",
                text: "I love how easy it is to send money internationally. No hidden fees and the exchange rates are always fair.",
                rating: 5,
              },
            ].map((review) => (
              <div key={review.name} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#fbbf24] fill-[#fbbf24]" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{review.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fbbf24]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">{review.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                    <p className="text-xs text-slate-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#fbbf24]/5 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of users who have already made the switch to modern banking. Open your account in under 2 minutes.
            </p>
            <Link to="/login">
              <Button className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full px-10 py-7 text-lg shadow-xl shadow-amber-400/25 transition-all hover:shadow-2xl hover:scale-105">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-slate-400 mt-6">No credit check required. No monthly fees.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-[#fbbf24] flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-900">OneUnited</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modern banking for the digital age. Secure, fast, and fee-free.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Product</p>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Features</p>
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Security</p>
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Pricing</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Company</p>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">About</p>
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Blog</p>
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Careers</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Legal</p>
              <div className="space-y-2">
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Privacy</p>
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Terms</p>
                <p className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Cookies</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              &copy; 2026 OneUnited Bank. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Shield className="w-4 h-4 text-slate-300" />
              <Lock className="w-4 h-4 text-slate-300" />
              <Globe className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
