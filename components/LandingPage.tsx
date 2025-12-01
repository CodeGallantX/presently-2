import React, { useState } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, QrCode, Smartphone, BarChart3, 
  ShieldCheck, MapPin, Clock, Share2, Users, 
  ChevronDown, ChevronUp, Star, Download, Menu, X, Play,
  Zap, MonitorPlay, Pause, Volume2, Maximize2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'semester' | 'session'>('semester');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Testimonials</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-medium text-white hover:text-primary transition-colors">
              Sign In
            </button>
            <Button onClick={onGetStarted} size="sm" className="rounded-full px-6 shadow-primary/20">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-950 border-b border-zinc-800 p-6 space-y-4 overflow-hidden"
            >
              <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-zinc-400">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-zinc-400">Pricing</button>
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
                <Button onClick={onLogin} variant="secondary" className="w-full justify-center">Sign In</Button>
                <Button onClick={onGetStarted} className="w-full justify-center">Get Started</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8 text-center lg:text-left z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-bold text-primary backdrop-blur-md hover:bg-zinc-900 transition-colors cursor-default shadow-lg shadow-black/20">
                <Zap size={14} className="fill-primary" />
                <span className="text-white font-normal">New:</span> Real-time Geofencing 2.0
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Attendance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200 relative inline-block pb-2">
                Reimagined
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Eliminate paper sheets and proxy attendance. Empower your institution with GPS-verified check-ins, instant analytics, and seamless reporting.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={onGetStarted} className="h-14 px-8 text-lg rounded-full w-full sm:w-auto hover:scale-105 transition-transform duration-200">
                Get Started Free <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/10 text-white">
                <Play size={18} fill="currentColor" /> Live Demo
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start gap-6 pt-4">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                       <Users size={16} />
                    </div>
                  ))}
               </div>
               <div className="text-left">
                  <div className="flex text-primary">
                     <Star size={14} fill="currentColor" />
                     <Star size={14} fill="currentColor" />
                     <Star size={14} fill="currentColor" />
                     <Star size={14} fill="currentColor" />
                     <Star size={14} fill="currentColor" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium"><span className="text-white font-bold">4.9/5</span> from 20+ Universities</p>
               </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="relative mx-auto lg:mx-0 w-full max-w-[500px] lg:max-w-none perspective-1000"
          >
            <div className="relative z-10 transform hover:rotate-y-2 hover:rotate-x-2 transition-transform duration-500 preserve-3d">
              {/* Main App Window */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-2 shadow-2xl shadow-primary/20 relative">
                 {/* Floating Badges */}
                 <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -left-8 top-12 bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-xl z-20 hidden md:flex items-center gap-3"
                 >
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-500"><CheckCircle2 size={20} /></div>
                    <div>
                       <p className="text-xs text-zinc-400">Attendance</p>
                       <p className="text-sm font-bold text-white">Verified</p>
                    </div>
                 </motion.div>

                 <motion.div 
                    animate={{ y: [0, 10, 0] }} 
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute -right-6 bottom-20 bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-xl z-20 hidden md:flex items-center gap-3"
                 >
                    <div className="bg-primary/20 p-2 rounded-lg text-primary"><MapPin size={20} /></div>
                    <div>
                       <p className="text-xs text-zinc-400">Location</p>
                       <p className="text-sm font-bold text-white">Within Range</p>
                    </div>
                 </motion.div>

                 {/* Window Content */}
                 <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/50">
                    {/* Fake Browser Header */}
                    <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 gap-2">
                       <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                       </div>
                       <div className="ml-4 bg-zinc-900 rounded-md px-3 py-1 text-[10px] text-zinc-500 w-48 text-center border border-zinc-800">presently.app/dashboard</div>
                    </div>
                    
                    {/* Dashboard Mockup */}
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                           <div>
                              <div className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Good Morning</div>
                              <div className="text-white font-bold text-2xl">Prof. Adeleke</div>
                           </div>
                           <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">PA</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-zinc-500 text-xs">Live Session</span>
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              </div>
                              <div className="text-2xl font-bold text-white mb-1">CS 402</div>
                              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                                 <div className="bg-primary w-[75%] h-full"></div>
                              </div>
                              <div className="mt-2 text-xs text-zinc-400 flex justify-between">
                                 <span>Attendance</span>
                                 <span className="text-white font-bold">75%</span>
                              </div>
                           </div>
                           <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-center items-center text-center">
                               <QrCode size={40} className="text-white mb-2" />
                               <span className="text-xs text-zinc-500">Scan to Join</span>
                           </div>
                        </div>

                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-sm font-bold text-white">Recent Activity</span>
                              <span className="text-xs text-primary">View All</span>
                           </div>
                           <div className="space-y-3">
                              {[1,2,3].map(i => (
                                 <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 border border-zinc-800">S{i}</div>
                                    <div className="flex-1">
                                       <div className="text-xs font-bold text-white">Student {i}</div>
                                       <div className="text-[10px] text-zinc-500">Marked present via QR</div>
                                    </div>
                                    <div className="text-[10px] text-zinc-600">10:0{i} AM</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Social Proof --- */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-zinc-500 mb-6 uppercase tracking-wider">Trusted by leading institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos for Universities */}
            <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-8 h-8 bg-white/20 rounded-full"></div> University of Lagos</span>
            <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-8 h-8 bg-white/20 rounded-full"></div> Covenant University</span>
            <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-8 h-8 bg-white/20 rounded-full"></div> University of Ibadan</span>
            <span className="text-xl font-bold text-white flex items-center gap-2"><div className="w-8 h-8 bg-white/20 rounded-full"></div> Ahmadu Bello University</span>
          </div>
        </div>
      </section>

      {/* --- Features Grid (Enhanced) --- */}
      <section id="features" className="py-24 px-6 relative bg-zinc-950/50">
         {/* Subtle pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powerful Features for Modern Education</h2>
            <p className="text-zinc-400 text-lg">Everything you need to streamline attendance management and boost engagement.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <MapPin className="text-primary" />,
                title: "GPS-Verified Check-ins",
                desc: "Location-based attendance ensures students are physically present in class within a set radius."
              },
              {
                icon: <Clock className="text-primary" />,
                title: "Smart Scheduling",
                desc: "Integrated timetables ensure attendance only works during valid class hours."
              },
              {
                icon: <BarChart3 className="text-primary" />,
                title: "Real-Time Dashboards",
                desc: "Live attendance tracking with instant updates and beautiful visualizations for lecturers."
              },
              {
                icon: <ShieldCheck className="text-primary" />,
                title: "Anti-Fraud Protection",
                desc: "Smart rules and device validation prevent attendance manipulation and ensure accuracy."
              },
              {
                icon: <Share2 className="text-primary" />,
                title: "One-Click Exports",
                desc: "Generate professional reports in PDF, Excel, or CSV format instantly for administration."
              },
              {
                icon: <Smartphone className="text-primary" />,
                title: "Smart Analytics",
                desc: "Detailed insights and trends to help improve attendance and identify at-risk students."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="bg-black/40 backdrop-blur-sm border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900/60 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-primary/5"
              >
                <div className="bg-zinc-900 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-300 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
                <div className="mt-6 flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Learn more <ArrowRight size={16} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.4 }}
             className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-zinc-800 pt-12 bg-zinc-900/30 rounded-3xl p-8 backdrop-blur-sm"
          >
             <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
                <div className="text-zinc-500 font-medium">Accuracy Rate</div>
             </div>
             <div className="text-center border-l-0 md:border-l border-zinc-800">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-zinc-500 font-medium">Active Users</div>
             </div>
             <div className="text-center border-l-0 md:border-l border-zinc-800">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">5min</div>
                <div className="text-zinc-500 font-medium">Setup Time</div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- How It Works (Enhanced with Video UI) --- */}
      <section id="how-it-works" className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
        {/* Background blob */}
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
             <p className="text-zinc-400">Get started in minutes with our simple, intuitive process.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-0 relative"
            >
              {/* Vertical Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-zinc-800"></div>

              {[
                { num: "01", title: "Sign Up & Choose Role", desc: "Create your account and select whether you're a student, lecturer, or class representative." },
                { num: "02", title: "Mark or Track Attendance", desc: "Students scan QR codes or use GPS. Lecturers create sessions and monitor in real-time." },
                { num: "03", title: "View Analytics", desc: "Access detailed insights, trends, and attendance patterns through beautiful dashboards." },
                { num: "04", title: "Export & Share", desc: "Generate professional reports in PDF, Excel, or CSV format with one click." }
              ].map((step, i) => (
                <div key={i} className="flex gap-8 relative pb-12 last:pb-0 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-4 border-zinc-950 bg-zinc-800 group-hover:bg-primary group-hover:text-black flex items-center justify-center text-zinc-400 font-bold text-lg relative z-10 transition-colors duration-300">
                      {step.num}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
                    </div>
                </div>
              ))}
            </motion.div>
            
            {/* Mock Video Player */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
                <div className="aspect-video bg-zinc-900 rounded-3xl border border-zinc-800 relative overflow-hidden group shadow-2xl shadow-black/50">
                     {/* Video Content Placeholder */}
                     {!isVideoPlaying ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                             <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 opacity-50"></div>
                             {/* Abstract graphic */}
                             <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                 <div className="w-64 h-64 bg-primary rounded-full blur-[80px]"></div>
                             </div>
                             
                             <div className="z-10 text-center space-y-4">
                                 <button 
                                    onClick={() => setIsVideoPlaying(true)}
                                    className="w-20 h-20 bg-primary rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(255,202,13,0.4)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,202,13,0.6)] transition-all duration-300 group-hover:bg-white"
                                 >
                                    <Play size={32} className="text-black fill-black" />
                                 </button>
                                 <p className="text-white font-bold tracking-wide">Watch Demo</p>
                             </div>

                             {/* Fake UI Elements */}
                             <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 text-white/50">
                                 <Play size={20} fill="currentColor" />
                                 <div className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden">
                                     <div className="w-1/3 h-full bg-primary"></div>
                                 </div>
                                 <span className="text-xs font-mono">01:24 / 03:45</span>
                                 <Volume2 size={20} />
                                 <Maximize2 size={20} />
                             </div>
                         </div>
                     ) : (
                         <div className="absolute inset-0 bg-black flex items-center justify-center">
                             <div className="text-center">
                                 <p className="text-zinc-500 mb-4">Demo video playing...</p>
                                 <Button variant="outline" size="sm" onClick={() => setIsVideoPlaying(false)}>
                                     <Pause size={16} className="mr-2" /> Pause
                                 </Button>
                             </div>
                             {/* Progress Bar Animation */}
                             <div className="absolute bottom-0 left-0 h-1 bg-primary w-full animate-[progress_10s_linear_infinite]">
                                <style>{`
                                    @keyframes progress { from { width: 0%; } to { width: 100%; } }
                                `}</style>
                             </div>
                         </div>
                     )}
                </div>
                {/* Decorative elements around video */}
                <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-zinc-800 rounded-3xl bg-zinc-950/50"></div>
                <div className="absolute -z-20 -bottom-12 -right-12 w-full h-full border-2 border-zinc-900 rounded-3xl bg-zinc-950/30"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Pricing (Enhanced with Toggle) --- */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
            <p className="text-zinc-400 text-lg mb-8">Pay securely to access full features.</p>
            
            {/* Billing Toggle */}
            <div className="inline-flex bg-zinc-900 border border-zinc-800 p-1 rounded-full relative">
                 <button 
                    onClick={() => setBillingCycle('semester')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative z-10 ${billingCycle === 'semester' ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
                 >
                     Per Semester
                 </button>
                 <button 
                    onClick={() => setBillingCycle('session')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative z-10 ${billingCycle === 'session' ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
                 >
                     Per Session <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full ml-1 absolute -top-2 -right-2">2x</span>
                 </button>
                 {/* Sliding Background */}
                 <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 ${billingCycle === 'semester' ? 'left-1' : 'left-[calc(50%+4px)]'}`}></div>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start pt-8"
          >
            {/* Students Plan */}
            <motion.div variants={fadeInUp} className="bg-black border border-zinc-800 rounded-3xl p-8 pt-10 mt-4 md:mt-0 hover:border-zinc-700 transition-colors">
               <h3 className="text-xl font-bold text-white">Students</h3>
               <p className="text-zinc-400 text-sm mt-2">For academic tracking & attendance.</p>
               <div className="my-6">
                   <span className="text-4xl font-bold text-white">₦ {billingCycle === 'semester' ? '1,000' : '2,000'}</span>
                   <span className="text-zinc-500">/{billingCycle === 'semester' ? 'semester' : 'session'}</span>
               </div>
               <Button variant="secondary" className="w-full mb-8" disabled>Requires Registration</Button>
               <ul className="space-y-4">
                   {['Fast check-in (QR + GPS)', 'Attendance history & stats', 'Exam clearance PDF', 'Absence alerts', 'Digital signature'].map((feat, i) => (
                       <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                           <CheckCircle2 size={16} className="text-zinc-600 flex-shrink-0" /> {feat}
                       </li>
                   ))}
               </ul>
            </motion.div>

            {/* Lecturers Plan (Highlighted) */}
            <motion.div variants={fadeInUp} className="bg-zinc-900 border-2 border-primary rounded-3xl p-8 relative shadow-2xl shadow-primary/10 transform scale-105 z-10">
               <div className="absolute top-0 right-0 left-0 bg-primary text-black text-center text-xs font-bold py-1.5 rounded-t-2xl">FULL ACCESS</div>
               <div className="pt-4">
                   <h3 className="text-xl font-bold text-white">Lecturers</h3>
                   <p className="text-zinc-400 text-sm mt-2">For educators & course management.</p>
                   <div className="my-6">
                       <span className="text-4xl font-bold text-white">₦ {billingCycle === 'semester' ? '3,000' : '6,000'}</span>
                       <span className="text-zinc-500">/{billingCycle === 'semester' ? 'semester' : 'session'}</span>
                   </div>
                   <Button className="w-full mb-8" size="lg" onClick={onGetStarted}>Get Started</Button>
                   <ul className="space-y-4">
                       {['Unlimited courses & sessions', 'Real-time attendance (QR + GPS)', 'Instant exports (PDF/Excel)', 'Automated exam clearance', 'Attendance validation alerts', 'Student reminders'].map((feat, i) => (
                           <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                               <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> {feat}
                           </li>
                       ))}
                   </ul>
               </div>
            </motion.div>

             {/* Departments Plan */}
            <motion.div variants={fadeInUp} className="bg-black border border-zinc-800 rounded-3xl p-8 pt-10 mt-4 md:mt-0 hover:border-zinc-700 transition-colors">
               <h3 className="text-xl font-bold text-white">Departments</h3>
               <p className="text-zinc-400 text-sm mt-2">For centralized control.</p>
               <div className="my-6">
                   <span className="text-4xl font-bold text-white">Custom</span>
               </div>
               <Button variant="outline" className="w-full mb-8">Contact Sales</Button>
               <ul className="space-y-4">
                   {['All lecturer + student features', 'Department-wide dashboard', 'Bulk analytics & reports', 'Compliance tools', 'White-label branding', 'Dedicated support', 'SIS/LMS Integrations'].map((feat, i) => (
                       <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                           <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> {feat}
                       </li>
                   ))}
               </ul>
            </motion.div>
          </motion.div>
          
          <div className="max-w-4xl mx-auto mt-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
             <h3 className="text-xl font-bold text-white mb-4">How Billing Works</h3>
             <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <div className="font-bold text-white mb-2">1. Register & Select Role</div>
                    <p className="text-sm text-zinc-400">Sign up and choose whether you are a Student or Lecturer.</p>
                </div>
                <div>
                    <div className="font-bold text-white mb-2">2. Secure Payment</div>
                    <p className="text-sm text-zinc-400">Pay the semester fee securely via card, transfer, or USSD.</p>
                </div>
                <div>
                    <div className="font-bold text-white mb-2">3. Instant Access</div>
                    <p className="text-sm text-zinc-400">Gain immediate access to your dashboard and features.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-6 bg-zinc-950 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
             <p className="text-zinc-400">Everything you need to know about Presently.</p>
          </div>
          <div className="space-y-4">
            {[
              "How does GPS verification work?",
              "What if my GPS is turned off or inaccurate?",
              "Can attendance be faked or manipulated?",
              "Does Presently work offline?",
              "What devices and platforms are supported?",
              "How do you ensure student privacy?",
              "Can I integrate Presently with existing school systems?",
              "What kind of support do you provide?"
            ].map((question, i) => (
              <div key={i} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-zinc-900 transition-colors"
                >
                  {question}
                  {openFaqIndex === i ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                </button>
                <AnimatePresence>
                  {openFaqIndex === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 bg-zinc-900/30">
                        Presently uses advanced geolocation technology to verify that a student is physically within the classroom's designated area when checking in. This prevents students from sharing codes remotely.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
             <p className="text-zinc-400 mb-4">Still have questions?</p>
             <div className="flex justify-center gap-4">
                <Button variant="secondary">Contact Support</Button>
                <Button variant="ghost">Schedule Demo</Button>
             </div>
          </div>
        </div>
      </section>

      {/* --- Install App --- */}
      <section className="py-24 px-6">
         <div className="max-w-5xl mx-auto bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold text-white">Install Presently on Your Device</h2>
                <p className="text-zinc-400 text-lg">Get the full app experience directly from your home screen for quick access to attendance.</p>
                
                <div className="space-y-6 pt-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-zinc-800 p-3 rounded-xl">
                           <Smartphone size={24} className="text-primary" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">Install for Android</h4>
                            <p className="text-zinc-500 text-sm mb-2">Add to home screen for quick access.</p>
                            <button className="text-primary text-sm font-bold hover:underline">Install App</button>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-zinc-800 p-3 rounded-xl">
                           <Download size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold">Install for iOS</h4>
                            <p className="text-zinc-500 text-sm mb-2">Use 'Share' &gt; 'Add to Home Screen'.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex justify-center">
                 <div className="w-[280px] h-[580px] border-8 border-zinc-900 rounded-[3rem] bg-zinc-950 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 w-32 h-6 bg-zinc-900 rounded-b-xl left-1/2 -translate-x-1/2 z-20"></div>
                    <div className="flex-1 bg-black flex flex-col items-center justify-center text-center p-6 space-y-4">
                         <div className="bg-primary p-4 rounded-2xl mb-4">
                            <QrCode size={48} className="text-black" />
                         </div>
                         <h3 className="text-white font-bold text-xl">Presently</h3>
                         <p className="text-zinc-500 text-sm">Smart Attendance</p>
                         <Button size="sm" className="w-full">Open App</Button>
                    </div>
                 </div>
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-black border-t border-zinc-900 pt-16 pb-8 px-6 text-sm">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                <div className="col-span-2 lg:col-span-2 space-y-4 pr-8">
                    <Logo />
                    <p className="text-zinc-400 leading-relaxed max-w-sm">
                        Making attendance effortless for students, lecturers, and institutions across Africa. Join thousands who have already transformed their attendance experience.
                    </p>
                    <div className="pt-4 space-y-2">
                        <div className="flex gap-2">
                            <input type="email" placeholder="Enter your email" className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white w-full focus:ring-1 focus:ring-primary outline-none" />
                            <Button size="sm">Subscribe</Button>
                        </div>
                        <p className="text-xs text-zinc-600">Stay updated with our newsletter.</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Product</h4>
                    <ul className="space-y-2 text-zinc-500">
                        <li><button className="hover:text-white transition-colors">Features</button></li>
                        <li><button className="hover:text-white transition-colors">Pricing</button></li>
                        <li><button className="hover:text-white transition-colors">How it Works</button></li>
                        <li><button className="hover:text-white transition-colors">Security</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-zinc-500">
                        <li><button className="hover:text-white transition-colors">About Us</button></li>
                        <li><button className="hover:text-white transition-colors">Blog</button></li>
                        <li><button className="hover:text-white transition-colors">Careers</button></li>
                        <li><button className="hover:text-white transition-colors">Contact</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-zinc-500">
                        <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                        <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                        <li><button className="hover:text-white transition-colors">Cookie Policy</button></li>
                        <li><button className="hover:text-white transition-colors">GDPR</button></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600">
                <p>&copy; {new Date().getFullYear()} Presently. All rights reserved.</p>
                <div className="flex gap-6">
                    <span>Lagos, Nigeria</span>
                    <span>hello@presently.app</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};