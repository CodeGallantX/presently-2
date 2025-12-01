import React, { useState, useRef, useEffect } from 'react';
import { QrCode, BookOpen, Clock, AlertCircle, TrendingUp, Calendar, X, Image as ImageIcon, Keyboard, Plus, MapPin, CheckCircle2, ChevronRight, Activity, Loader2, LocateFixed, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

interface StudentDashboardProps {
  userName: string;
  view?: string;
}

interface Course {
    code: string;
    name: string;
    attendance: number;
    status: 'Good' | 'Average' | 'Warning';
    time: string;
    registered: boolean;
}

// Mock Database mapping Session Codes to Course Codes for validation
const MOCK_SESSION_DATABASE: Record<string, string> = {
    'AWD82X9L': 'CS402',
    'DB301QWZ': 'CS301',
    'ENG101XS': 'ENG101',
    'MTH202AB': 'MTH202',
    'PHY101ZZ': 'PHY101',
    'GNS101XY': 'GNS101'
};

// Enhanced Mark Attendance Modal
const MarkAttendanceModal = ({ 
    isOpen, 
    onClose, 
    onVerify
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onVerify: (code: string) => Promise<boolean>;
}) => {
    const [activeTab, setActiveTab] = useState<'scan' | 'code'>('scan');
    const [sessionCode, setSessionCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'locating' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setSessionCode('');
            setStatus('idle');
            setErrorMsg('');
            setActiveTab('scan');
        }
    }, [isOpen]);

    // Camera Logic
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isOpen && activeTab === 'scan' && status === 'idle') {
            const startCamera = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Wait for video to actually start playing
                        videoRef.current.onloadedmetadata = () => {
                            setIsCameraActive(true);
                        };
                    }
                } catch (err) {
                    console.error("Camera access error:", err);
                    setIsCameraActive(false);
                }
            };
            startCamera();
        } else {
            setIsCameraActive(false);
            if (stream) {
                // @ts-ignore
                stream.getTracks().forEach(track => track.stop());
            }
        }
        return () => {
            if (stream) {
                 // @ts-ignore
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen, activeTab, status]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        setSessionCode(val);
    };

    const processAttendance = async (codeToVerify: string) => {
        if (!codeToVerify || codeToVerify.length < 8) return;

        try {
            // Step 1: Geolocation Check
            setStatus('locating');
            
            await new Promise<void>((resolve, reject) => {
                if (!navigator.geolocation) {
                    // Fallback for non-supported browsers or insecure contexts
                    console.warn("Geolocation not supported/secure.");
                    setTimeout(resolve, 1000); 
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setTimeout(resolve, 1500); 
                    },
                    (error) => {
                         // Fallback on error for demo purposes
                        console.warn("Locating failed, proceeding in mock mode");
                        setTimeout(resolve, 1000);
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            });

            // Step 2: Code Verification
            setStatus('verifying');
            const success = await onVerify(codeToVerify);
            
            if (success) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setStatus('error');
                setErrorMsg("Invalid or expired session code.");
            }

        } catch (err: any) {
            setStatus('error');
            setErrorMsg(typeof err === 'string' ? err : "An unexpected error occurred.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
             {/* Scanning Animation Styles */}
            <style>{`
                @keyframes scan-line {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .scan-line-anim {
                    animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>

            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative h-[550px]"
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center z-20 bg-gradient-to-b from-zinc-900/90 to-transparent absolute top-0 left-0 right-0 pointer-events-none">
                    <button 
                        onClick={onClose} 
                        className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-colors pointer-events-auto"
                    >
                        <X size={20} />
                    </button>
                    <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                        Attendance Mode
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative bg-black flex flex-col h-full">
                    {/* State: IDLE - Show Scanner or Input */}
                    {status === 'idle' && (
                        <>
                            {activeTab === 'scan' ? (
                                <div className="flex-1 relative w-full h-full bg-black">
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted
                                        className="w-full h-full object-cover absolute inset-0" 
                                    />
                                    {!isCameraActive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 z-20">
                                            <Loader2 size={32} className="animate-spin mb-2 text-primary" />
                                            <p className="text-sm">Accessing Camera...</p>
                                        </div>
                                    )}
                                    
                                    {/* Scanner Overlay UI */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative overflow-hidden bg-white/5 backdrop-blur-[2px]">
                                            {/* Corner Markers */}
                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                                            
                                            {/* Scanning Beam */}
                                            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent scan-line-anim shadow-[0_0_15px_rgba(255,202,13,0.8)]"></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-24 left-0 right-0 text-center z-10">
                                        <p className="text-white/80 text-sm font-medium drop-shadow-md bg-black/40 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                                            Scan Session QR Code
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900 h-full">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-pulse">
                                        <Keyboard size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Enter Code</h3>
                                    <p className="text-zinc-400 text-center text-sm mb-8">
                                        Type the 8-character session code displayed on the screen.
                                    </p>
                                    
                                    <div className="w-full max-w-xs space-y-6">
                                        <input 
                                            type="text" 
                                            value={sessionCode}
                                            onChange={handleCodeChange}
                                            maxLength={8}
                                            placeholder="XXXXXXXX"
                                            className="w-full bg-black border-2 border-zinc-700 rounded-2xl px-4 py-5 text-center text-3xl font-mono tracking-[0.3em] uppercase text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-zinc-800"
                                            autoFocus
                                        />
                                        <Button 
                                            className="w-full h-14 text-lg font-bold rounded-xl" 
                                            disabled={sessionCode.length < 8} 
                                            onClick={() => processAttendance(sessionCode)}
                                        >
                                            Verify & Mark
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* State: LOCATING */}
                    {status === 'locating' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900 text-center h-full">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center animate-ping absolute inset-0"></div>
                                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center relative z-10">
                                    <MapPin size={40} className="text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Checking Location</h3>
                            <p className="text-zinc-400 text-sm max-w-[200px]">
                                Verifying you are within range of the venue...
                            </p>
                        </div>
                    )}

                    {/* State: VERIFYING */}
                    {status === 'verifying' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900 text-center h-full">
                            <Loader2 size={48} className="text-primary animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Verifying Code</h3>
                            <p className="text-zinc-400 text-sm">Please wait a moment...</p>
                        </div>
                    )}

                    {/* State: SUCCESS */}
                    {status === 'success' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900 text-center h-full">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                type="spring"
                                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                            >
                                <CheckCircle2 size={48} className="text-black" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">Attendance Marked!</h3>
                            <p className="text-zinc-400 text-sm">You have successfully checked in.</p>
                        </div>
                    )}

                    {/* State: ERROR */}
                    {status === 'error' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-900 text-center h-full">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/50"
                            >
                                <X size={48} className="text-red-500" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
                            <p className="text-red-400 text-sm mb-6 max-w-[240px]">{errorMsg}</p>
                            <Button variant="secondary" onClick={() => setStatus('idle')}>Try Again</Button>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Tabs (Only visible when idle) */}
                {status === 'idle' && (
                    <div className="bg-zinc-950 p-2 flex gap-2 border-t border-zinc-800 z-20">
                        <button 
                            onClick={() => setActiveTab('scan')}
                            className={`flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'scan' ? 'bg-zinc-800 text-primary' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                        >
                            <QrCode size={20} />
                            <span className="text-xs font-medium">Scan QR</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'code' ? 'bg-zinc-800 text-primary' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                        >
                            <Keyboard size={20} />
                            <span className="text-xs font-medium">Enter Code</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// Course Registration Modal
const CourseRegistrationModal = ({
    isOpen,
    onClose,
    allCourses,
    onToggleCourse
}: {
    isOpen: boolean;
    onClose: () => void;
    allCourses: Course[];
    onToggleCourse: (code: string) => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Course Registration</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {allCourses.map((course) => (
                        <div key={course.code} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <div>
                                <p className="text-white font-bold">{course.code}</p>
                                <p className="text-sm text-zinc-500">{course.name}</p>
                            </div>
                            <Button 
                                size="sm" 
                                variant={course.registered ? "outline" : "primary"}
                                onClick={() => onToggleCourse(course.code)}
                                className={course.registered ? "border-green-500 text-green-500 hover:bg-green-500/10" : ""}
                            >
                                {course.registered ? <><CheckCircle2 size={14} className="mr-1"/> Registered</> : "Register"}
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="pt-4 mt-4 border-t border-zinc-800">
                    <Button className="w-full" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  
  // State for courses to manage registration
  const [courses, setCourses] = useState<Course[]>([
    { code: 'CS402', name: 'Adv. Web Dev', attendance: 92, status: 'Good', time: 'Mon 10:00 AM', registered: true },
    { code: 'CS301', name: 'Database Systems', attendance: 85, status: 'Average', time: 'Tue 2:00 PM', registered: true },
    { code: 'ENG101', name: 'Technical Writing', attendance: 65, status: 'Warning', time: 'Wed 11:00 AM', registered: true },
    { code: 'MTH202', name: 'Linear Algebra', attendance: 95, status: 'Good', time: 'Fri 9:00 AM', registered: true },
    { code: 'PHY101', name: 'General Physics', attendance: 0, status: 'Good', time: 'Thu 9:00 AM', registered: false },
    { code: 'GNS101', name: 'Use of English', attendance: 0, status: 'Good', time: 'Fri 2:00 PM', registered: false },
  ]);

  const registeredCourses = courses.filter(c => c.registered);
  const lowAttendanceCourses = registeredCourses.filter(c => c.attendance < 75);
  const avgAttendance = Math.round(registeredCourses.reduce((acc, c) => acc + c.attendance, 0) / (registeredCourses.length || 1));
  const nextClass = { name: 'CS402 - Adv. Web Dev', time: '10:00 AM', venue: 'LH 1' };

  // Analytics Mock Data
  const weeklyAttendanceData = [
    { name: 'W1', attendance: 70 },
    { name: 'W2', attendance: 85 },
    { name: 'W3', attendance: 80 },
    { name: 'W4', attendance: 90 },
    { name: 'W5', attendance: 95 },
  ];

  const attendanceStatusData = [
    { name: 'Present', value: 35, color: '#22c55e' },
    { name: 'Late', value: 5, color: '#eab308' },
    { name: 'Absent', value: 2, color: '#ef4444' },
  ];

  const handleToggleCourse = (code: string) => {
      setCourses(prev => prev.map(c => c.code === code ? { ...c, registered: !c.registered } : c));
  };

  const verifyAttendanceCode = async (code: string): Promise<boolean> => {
      await new Promise(r => setTimeout(r, 1500)); // Simulate network check

      // 1. Identify Course from Code
      const courseCode = MOCK_SESSION_DATABASE[code.toUpperCase()];
      
      if (!courseCode) {
          // In real app, this returns false. 
          // But to be UX friendly in this mock:
          // If the code isn't in our tiny database, let's pretend it failed.
          return false;
      }

      // 2. Find Course Data
      const course = courses.find(c => c.code === courseCode);
      if (!course) return false;

      // 3. Check Registration Status
      if (!course.registered) return false;

      // 4. Success Logic
      setCourses(prev => prev.map(c => 
          c.code === courseCode 
          ? { ...c, attendance: Math.min(100, c.attendance + 5) }
          : c
      ));

      return true;
  };

  // --- Views ---

  if (view === 'timetable') {
      return (
          <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Class Timetable</h2>
                  <Button onClick={() => setIsRegistrationOpen(true)}>
                      <Plus size={18} className="mr-2" /> Register Courses
                  </Button>
              </div>
              
              <div className="grid gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                          <h3 className="text-primary font-bold mb-3">{day}</h3>
                          <div className="space-y-3">
                              {registeredCourses.filter(c => c.time.startsWith(day.slice(0,3))).length > 0 ? (
                                registeredCourses.filter(c => c.time.startsWith(day.slice(0,3))).map((c, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-zinc-500 dark:text-zinc-400">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-zinc-900 dark:text-white font-medium">{c.code} - {c.name}</p>
                                            <p className="text-sm text-zinc-500">{c.time}</p>
                                        </div>
                                    </div>
                                ))
                              ) : (
                                  <p className="text-sm text-zinc-500 italic">No classes scheduled.</p>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  if (view === 'analytics') {
      return (
          <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Performance Insights</h2>
                  <p className="text-zinc-500">Track your attendance trends and statistics.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Attendance</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{avgAttendance}%</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Present</p>
                      <p className="text-2xl font-bold text-green-500 mt-1">35</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Late</p>
                      <p className="text-2xl font-bold text-yellow-500 mt-1">5</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">Absent</p>
                      <p className="text-2xl font-bold text-red-500 mt-1">2</p>
                  </div>
              </div>

              {/* Charts Layout - Circular Chart First */}
              <div className="grid md:grid-cols-12 gap-6">
                  {/* Pie Chart (Donut) */}
                  <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
                      <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Status Breakdown</h3>
                      <div className="h-64 w-full relative" style={{ minHeight: '256px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={attendanceStatusData}
                                      innerRadius={70}
                                      outerRadius={90}
                                      paddingAngle={4}
                                      dataKey="value"
                                      stroke="none"
                                  >
                                      {attendanceStatusData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                     contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                  />
                                  <Legend 
                                     verticalAlign="bottom" 
                                     height={36} 
                                     iconType="circle"
                                     formatter={(value) => <span className="text-zinc-500 text-sm ml-1">{value}</span>}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                          {/* Centered Percentage */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                               <div className="text-center">
                                   <p className="text-4xl font-bold text-zinc-900 dark:text-white">{avgAttendance}%</p>
                                   <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total</p>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Line Chart (Area with Gradient) */}
                  <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                      <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Weekly Attendance Trend</h3>
                      <div className="h-64 w-full" style={{ minHeight: '256px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weeklyAttendanceData}>
                                  <defs>
                                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ffca0d" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#ffca0d" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.3} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} domain={[0, 100]} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#ffca0d' }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="attendance" 
                                    stroke="#ffca0d" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorAttendance)" 
                                  />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>

              {/* Detailed Course Breakdown */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                      <h3 className="font-bold text-zinc-900 dark:text-white">Course Performance</h3>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {registeredCourses.map((course) => (
                          <div key={course.code} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                              <div className="flex-1">
                                  <div className="flex justify-between mb-2">
                                      <span className="font-bold text-zinc-900 dark:text-white text-sm">{course.code}</span>
                                      <span className={`text-sm font-bold ${course.attendance >= 75 ? 'text-green-500' : 'text-red-500'}`}>{course.attendance}%</span>
                                  </div>
                                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${course.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                                        style={{ width: `${course.attendance}%` }}
                                      ></div>
                                  </div>
                              </div>
                              <div className="ml-6 text-right w-32">
                                  <p className="text-xs text-zinc-500 truncate">{course.name}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // Default Dashboard View (Clean Redesign)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       {/* Greeting Header */}
       <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-zinc-500 text-sm font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">Hello, {userName.split(' ')[0]}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400">
              {userName.charAt(0)}
          </div>
       </div>

       {/* PROMINENT MARK ATTENDANCE HERO */}
       <button 
         onClick={() => setIsAttendanceModalOpen(true)}
         className="w-full relative overflow-hidden bg-primary text-black rounded-[2rem] p-6 md:p-8 shadow-xl shadow-primary/20 group transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/30 text-left flex items-center justify-between"
       >
          <div className="relative z-10">
              <div className="bg-black/10 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                  Action Required
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-2">Mark<br/>Attendance</h2>
              <p className="text-black/70 font-medium">Scan QR Code or Enter Session ID</p>
          </div>
          <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
               <QrCode size={48} className="text-black" />
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
       </button>

       {/* Warning Banner (Conditionally Rendered) */}
       <AnimatePresence>
         {lowAttendanceCourses.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-center gap-4"
           >
             <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
               <AlertCircle size={20} />
             </div>
             <div className="flex-1">
                 <p className="text-sm font-bold text-red-600 dark:text-red-300">Attendance Warning</p>
                 <p className="text-xs text-red-500 dark:text-red-400">
                   Below 75% in: {lowAttendanceCourses.map(c => c.code).join(', ')}
                 </p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Next Class Card */}
           <div className="bg-zinc-900 text-white p-6 rounded-3xl relative overflow-hidden border border-zinc-800">
               <div className="relative z-10">
                   <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Clock size={14} className="text-primary"/> Up Next
                   </p>
                   <h3 className="text-2xl font-bold mb-1">{nextClass.name}</h3>
                   <div className="flex items-center gap-4 mt-4">
                       <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                           <Clock size={14} className="text-zinc-400"/> {nextClass.time}
                       </div>
                       <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                           <MapPin size={14} className="text-zinc-400"/> {nextClass.venue}
                       </div>
                   </div>
               </div>
               <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                   <BookOpen size={150} />
               </div>
           </div>

           {/* Quick Stats / Actions */}
           <div className="space-y-4">
               <div className="flex gap-4">
                   <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col justify-between">
                       <div className="bg-green-100 dark:bg-green-900/20 w-8 h-8 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                           <TrendingUp size={16} />
                       </div>
                       <div>
                           <p className="text-2xl font-bold text-zinc-900 dark:text-white">{avgAttendance}%</p>
                           <p className="text-xs text-zinc-500">Avg. Attendance</p>
                       </div>
                   </div>
                   <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col justify-between">
                        <div className="bg-blue-100 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                           <BookOpen size={16} />
                        </div>
                       <div>
                           <p className="text-2xl font-bold text-zinc-900 dark:text-white">{registeredCourses.length}</p>
                           <p className="text-xs text-zinc-500">Active Courses</p>
                       </div>
                   </div>
               </div>
               <button 
                    onClick={() => setIsRegistrationOpen(true)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
               >
                   <div className="flex items-center gap-3">
                       <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-lg">
                           <Plus size={18} className="text-zinc-600 dark:text-zinc-400"/>
                       </div>
                       <div className="text-left">
                           <p className="font-bold text-zinc-900 dark:text-white text-sm">Register Courses</p>
                           <p className="text-xs text-zinc-500">Manage your enrollment</p>
                       </div>
                   </div>
                   <ChevronRight size={18} className="text-zinc-400" />
               </button>
           </div>
       </div>

       {/* Recent Activity List */}
       <div className="pt-4">
           <h3 className="font-bold text-zinc-900 dark:text-white mb-4 px-1">Recent Activity</h3>
           <div className="space-y-3">
               {[{ code: 'CS301', status: 'Present', time: 'Yesterday, 2:00 PM' }, { code: 'ENG101', status: 'Late', time: 'Wed, 11:15 AM' }].map((activity, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm">
                               {activity.code.substring(0,2)}
                           </div>
                           <div>
                               <p className="font-bold text-zinc-900 dark:text-white text-sm">{activity.code} Class</p>
                               <p className="text-xs text-zinc-500">{activity.time}</p>
                           </div>
                       </div>
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${activity.status === 'Present' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                           {activity.status}
                       </span>
                   </div>
               ))}
           </div>
       </div>

       {/* Modals */}
       <MarkAttendanceModal 
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onVerify={verifyAttendanceCode}
       />

       <CourseRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        allCourses={courses}
        onToggleCourse={handleToggleCourse}
       />
    </div>
  );
}