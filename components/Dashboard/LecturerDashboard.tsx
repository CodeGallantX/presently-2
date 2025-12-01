import React, { useState, useEffect, useRef } from 'react';
import { Plus, Users, Calendar, QrCode, Clock, ArrowUpDown, Trash2, X, Search, Camera, CheckCircle2, FileText, Download, BookOpen, MoreVertical, Share2, Copy, Edit2, AlertCircle, TrendingUp, TrendingDown, Filter, ChevronDown, BarChart3, Timer, AlertOctagon } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Session } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface LecturerDashboardProps {
  userName: string;
  view?: string;
}

interface Attendee {
  id: string;
  name: string;
  matricNumber: string;
  time: string;
  status: 'present' | 'late';
}

interface Course {
    id: string;
    name: string;
    code: string;
    students: number;
    venue: string;
}

interface Venue {
    id: string;
    name: string;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ userName, view = 'dashboard' }) => {
  // State
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      courseName: 'Advanced Web Development',
      courseCode: 'CS402',
      startTime: new Date(Date.now() - 1800000), // Started 30 mins ago
      endTime: new Date(Date.now() + 1800000), // Ends in 30 mins
      active: true,
      attendees: 42,
      sessionCode: 'AWD82X9L'
    },
    {
      id: '2',
      courseName: 'Database Systems',
      courseCode: 'CS301',
      startTime: new Date(Date.now() - 86400000),
      endTime: new Date(Date.now() - 82800000),
      active: false,
      attendees: 58,
      sessionCode: 'DB301QWZ'
    }
  ]);
  
  const [courses, setCourses] = useState<Course[]>([
      { id: '1', name: 'Advanced Web Development', code: 'CS402', students: 120, venue: 'LH 1' },
      { id: '2', name: 'Database Systems', code: 'CS301', students: 85, venue: 'Lab 3' },
      { id: '3', name: 'Software Engineering', code: 'CS410', students: 95, venue: 'LH 2' }
  ]);
  
  // Mock Venues
  const [venues] = useState<Venue[]>([
      { id: '1', name: 'Lecture Hall 1 (LH1)' },
      { id: '2', name: 'Lecture Hall 2 (LH2)' },
      { id: '3', name: 'Computer Lab 1' },
      { id: '4', name: 'Engineering Workshop' },
      { id: '5', name: '700 Seater Auditorium' },
  ]);
  
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Analytics State
  const [analyticsBenchmark, setAnalyticsBenchmark] = useState(70);
  const [analyticsCourse, setAnalyticsCourse] = useState('CS402');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  
  // Mock Student Analytics Data
  const [studentAnalytics] = useState([
    { id: '1', name: 'Alice Baker', matric: 'ENG/21/001', attended: 28, total: 30, dept: 'Computer Science', level: '400' },
    { id: '2', name: 'Bob Charlie', matric: 'ENG/21/002', attended: 15, total: 30, dept: 'Computer Science', level: '400' },
    { id: '3', name: 'Charlie Delta', matric: 'ENG/21/003', attended: 22, total: 30, dept: 'Computer Science', level: '400' },
    { id: '4', name: 'David Echo', matric: 'ENG/21/004', attended: 29, total: 30, dept: 'Computer Science', level: '400' },
    { id: '5', name: 'Eve Foxtrot', matric: 'ENG/21/005', attended: 10, total: 30, dept: 'Computer Science', level: '400' },
    { id: '6', name: 'Frank Golf', matric: 'ENG/21/006', attended: 25, total: 30, dept: 'Computer Science', level: '400' },
    { id: '7', name: 'Grace Hotel', matric: 'ENG/21/007', attended: 18, total: 30, dept: 'Computer Science', level: '400' },
    { id: '8', name: 'Henry India', matric: 'ENG/21/008', attended: 30, total: 30, dept: 'Computer Science', level: '400' },
    { id: '9', name: 'Ivy Juliet', matric: 'ENG/21/009', attended: 20, total: 30, dept: 'Computer Science', level: '400' },
    { id: '10', name: 'Jack Kilo', matric: 'ENG/21/010', attended: 5, total: 30, dept: 'Computer Science', level: '400' },
  ]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrModalSession, setQrModalSession] = useState<Session | null>(null);
  
  // Course Management Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState({ name: '', code: '', students: '', venue: '' });

  // Create Form State - UPDATED for Timer
  const [createSessionData, setCreateSessionData] = useState({
    courseId: '',
    venueId: '',
    durationValue: '60',
    durationUnit: 'minutes' as 'minutes' | 'hours'
  });

  // Helper to generate 8-digit alphanumeric code
  const generateSessionCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like I, 1, O, 0
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Force re-render every minute to update countdowns
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Check Expiration Helper
  const isSessionExpired = (endTime: Date) => {
      return now.getTime() > new Date(endTime).getTime();
  };

  // Derived State
  const filteredSessions = sessions
    .filter(s => {
      if (filter === 'active') return s.active && !isSessionExpired(s.endTime);
      if (filter === 'inactive') return !s.active || isSessionExpired(s.endTime);
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Analytics Processing
  const processedAnalytics = studentAnalytics.map(s => ({
      ...s,
      percentage: Math.round((s.attended / s.total) * 100),
  })).sort((a, b) => {
      // Sort by percentage descending
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      // Then by name alphabetical
      return a.name.localeCompare(b.name);
  });

  const filteredAnalytics = processedAnalytics.filter(s => 
      s.name.toLowerCase().includes(analyticsSearch.toLowerCase()) || 
      s.matric.toLowerCase().includes(analyticsSearch.toLowerCase())
  );
  
  const avgAttendance = Math.round(processedAnalytics.reduce((acc, curr) => acc + curr.percentage, 0) / processedAnalytics.length);
  const belowBenchmarkCount = processedAnalytics.filter(s => s.percentage < analyticsBenchmark).length;
  const aboveBenchmarkCount = processedAnalytics.length - belowBenchmarkCount;


  // Handlers
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
      if (selectedSessionId === sessionToDelete) setSelectedSessionId(null);
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCourse = courses.find(c => c.id === createSessionData.courseId);
    if (!selectedCourse) return;

    // Calculate times
    const startTime = new Date();
    const durationMs = createSessionData.durationUnit === 'minutes' 
        ? parseInt(createSessionData.durationValue) * 60 * 1000 
        : parseInt(createSessionData.durationValue) * 60 * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    const session: Session = {
      id: Date.now().toString(),
      courseName: selectedCourse.name,
      courseCode: selectedCourse.code,
      startTime: startTime,
      endTime: endTime,
      active: true,
      attendees: 0,
      sessionCode: generateSessionCode()
    };

    setSessions(prev => [session, ...prev]);
    setIsCreateModalOpen(false);
    // Reset Form
    setCreateSessionData({ courseId: '', venueId: '', durationValue: '60', durationUnit: 'minutes' });
    
    // Immediately open QR modal for convenience
    setQrModalSession(session);
  };
  
  const handleSaveCourse = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingCourse) {
          // Edit Logic
          setCourses(prev => prev.map(c => 
              c.id === editingCourse.id 
                  ? { 
                      ...c, 
                      name: courseFormData.name, 
                      code: courseFormData.code, 
                      students: parseInt(courseFormData.students), 
                      venue: courseFormData.venue 
                    } 
                  : c
          ));
      } else {
          // Add Logic
          const newCourse: Course = {
              id: Date.now().toString(),
              name: courseFormData.name,
              code: courseFormData.code,
              students: parseInt(courseFormData.students),
              venue: courseFormData.venue
          };
          setCourses(prev => [...prev, newCourse]);
      }
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      setCourseFormData({ name: '', code: '', students: '', venue: '' });
  };

  const openEditCourse = (course: Course) => {
      setEditingCourse(course);
      setCourseFormData({ name: course.name, code: course.code, students: course.students.toString(), venue: course.venue });
      setIsCourseModalOpen(true);
  };
  
  const openAddCourse = () => {
      setEditingCourse(null);
      setCourseFormData({ name: '', code: '', students: '', venue: '' });
      setIsCourseModalOpen(true);
  };

  const getMockAttendees = (count: number): Attendee[] => {
    return Array.from({ length: Math.min(count, 5) }).map((_, i) => ({
      id: i.toString(),
      name: `Student ${i + 1}`,
      matricNumber: `ENG/2021/${100 + i}`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: i % 4 === 0 ? 'late' : 'present'
    }));
  };
  
  const getSessionStats = (session: Session) => {
      // Find course to get total expected students
      const course = courses.find(c => c.code === session.courseCode) || { students: 100 }; // Default 100 if not found
      const totalStudents = course.students;
      
      const present = session.attendees;
      const late = Math.floor(present * 0.2); // Mock: 20% late
      const onTime = present - late;
      const absent = Math.max(0, totalStudents - present);
      
      const presentPercentage = Math.round((present / totalStudents) * 100);
      const latePercentage = Math.round((late / totalStudents) * 100);
      const absentPercentage = 100 - presentPercentage; // Simplified to sum to 100 for graph display
      
      return { present, late, absent, presentPercentage, latePercentage, absentPercentage, onTime, totalStudents };
  };

  const handleDownloadQr = async (session: Session) => {
      const link = `https://presently.app/attend/${session.sessionCode}`;
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`;
      try {
          const response = await fetch(url);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `Presently_QR_${session.courseCode}_${session.sessionCode}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
      } catch (error) {
          console.error("Error downloading QR:", error);
      }
  };

  const handleShareQr = async (session: Session) => {
      const link = `https://presently.app/attend/${session.sessionCode}`;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `Attendance: ${session.courseCode}`,
                  text: `Mark your attendance for ${session.courseName}. Session Code: ${session.sessionCode}`,
                  url: link,
              });
          } catch (error) {
              console.error("Error sharing:", error);
          }
      } else {
          try {
              await navigator.clipboard.writeText(`${link}\nCode: ${session.sessionCode}`);
              alert("Link and Code copied to clipboard!");
          } catch (err) {
              console.error("Failed to copy", err);
          }
      }
  };

  // Components
  const QRScannerModal = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
            }
        };
        if (isScannerOpen) startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    if (!isScannerOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-900 dark:text-white">Scan Student QR</h3>
                    <button onClick={() => setIsScannerOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X size={20}/></button>
                </div>
                <div className="relative aspect-square bg-black">
                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-primary/50 rounded-xl relative">
                             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                        </div>
                     </div>
                     <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80">Align QR code within frame</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 text-center">
                    <Button variant="secondary" onClick={() => setIsScannerOpen(false)}>Cancel Scanning</Button>
                </div>
            </div>
        </div>
    );
  };

  const SessionQRModal = () => {
      if (!qrModalSession) return null;
      const isExpired = isSessionExpired(qrModalSession.endTime);
      
      const link = `https://presently.app/attend/${qrModalSession.sessionCode}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
                  {/* Decorative Background */}
                  <div className={`absolute top-0 left-0 right-0 h-32 -z-10 rounded-b-[50%] scale-x-150 transition-colors duration-500 ${isExpired ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-primary/10'}`}></div>
                  
                  <button 
                    onClick={() => setQrModalSession(null)} 
                    className="absolute top-4 right-4 bg-black/5 dark:bg-white/10 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                      <X size={20}/>
                  </button>

                  <div className="flex flex-col items-center text-center mt-4">
                      {isExpired ? (
                          <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-2xl shadow-inner mb-6 w-48 h-48 flex flex-col items-center justify-center border-2 border-zinc-200 dark:border-zinc-700">
                              <AlertOctagon size={48} className="text-zinc-400 mb-2" />
                              <p className="text-zinc-500 font-bold">Session Expired</p>
                          </div>
                      ) : (
                          <div className="bg-white p-3 rounded-2xl shadow-lg mb-6">
                              <img src={qrUrl} alt="Session QR" className="w-48 h-48 object-contain" />
                          </div>
                      )}
                      
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{qrModalSession.courseCode}</h3>
                      <p className="text-zinc-500 text-sm mb-6">{qrModalSession.courseName}</p>
                      
                      {isExpired ? (
                           <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-500 flex items-center justify-center gap-2">
                               <AlertCircle size={18} />
                               <span className="font-bold">Portal Closed</span>
                           </div>
                      ) : (
                          <div className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6">
                              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Session Code</p>
                              <div className="flex items-center justify-center gap-3">
                                  <span className="text-3xl font-mono font-bold text-primary tracking-wider">{qrModalSession.sessionCode}</span>
                                  <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(qrModalSession.sessionCode);
                                        alert("Code copied!");
                                    }}
                                    className="text-zinc-400 hover:text-primary transition-colors"
                                  >
                                      <Copy size={18} />
                                  </button>
                              </div>
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 w-full">
                          <Button variant="secondary" onClick={() => handleDownloadQr(qrModalSession!)} className="w-full" disabled={isExpired}>
                              <Download size={18} className="mr-2" />
                              Save
                          </Button>
                          <Button onClick={() => handleShareQr(qrModalSession!)} className="w-full" disabled={isExpired}>
                              <Share2 size={18} className="mr-2" />
                              Share
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };
  
  const CourseModal = () => (
      isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                    <button onClick={() => setIsCourseModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X size={20}/></button>
                </div>
                <form onSubmit={handleSaveCourse} className="space-y-4">
                    <Input label="Course Name" placeholder="e.g. Intro to Computer Science" value={courseFormData.name} onChange={e => setCourseFormData({...courseFormData, name: e.target.value})} required />
                    <Input label="Course Code" placeholder="e.g. CS101" value={courseFormData.code} onChange={e => setCourseFormData({...courseFormData, code: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Total Students" type="number" placeholder="100" value={courseFormData.students} onChange={e => setCourseFormData({...courseFormData, students: e.target.value})} required />
                        <Input label="Default Venue" placeholder="LH 1" value={courseFormData.venue} onChange={e => setCourseFormData({...courseFormData, venue: e.target.value})} required />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCourseModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">{editingCourse ? 'Save Changes' : 'Add Course'}</Button>
                    </div>
                </form>
            </div>
        </div>
      )
  );

  // Render Views
  if (view === 'courses') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Courses</h2>
                  <Button onClick={openAddCourse}><Plus size={18} className="mr-2"/> Add Course</Button>
              </div>
              <div className="grid gap-4">
                  {courses.map(course => (
                      <div key={course.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{course.code}</h3>
                              <p className="text-zinc-500 dark:text-zinc-400">{course.name}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                                  <span className="flex items-center gap-1"><Users size={14}/> {course.students} Students</span>
                                  <span className="flex items-center gap-1"><Users size={14}/> {course.venue}</span>
                              </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openEditCourse(course)}>
                              <Edit2 size={16} className="mr-2" /> Edit
                          </Button>
                      </div>
                  ))}
              </div>
              {CourseModal()}
          </div>
      )
  }

  if (view === 'reports') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance Reports</h2>
              <div className="grid md:grid-cols-2 gap-6">
                  {courses.map(course => (
                      <div key={course.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                          <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{course.code} - {course.name}</h3>
                          <div className="space-y-2 mt-4">
                              <Button variant="secondary" className="w-full justify-between group">
                                  <span>Download CSV Report</span>
                                  <Download size={16} className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"/>
                              </Button>
                              <Button variant="secondary" className="w-full justify-between group">
                                  <span>Download PDF Report</span>
                                  <FileText size={16} className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"/>
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  if (view === 'timetable') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Weekly Timetable</h2>
                <Button variant="secondary">Edit Schedule</Button>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center text-zinc-500 shadow-sm">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your scheduled classes will appear here.</p>
              </div>
          </div>
      )
  }

  if (view === 'analytics') {
      return (
          <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance Analytics</h2>
                      <p className="text-zinc-500">Detailed insights for your courses.</p>
                  </div>
                  <Button variant="outline"><Download size={18} className="mr-2"/> Export Data</Button>
              </div>

              {/* Filters & Settings */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
                  <div>
                      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Select Course</label>
                      <div className="relative">
                          <select 
                            value={analyticsCourse}
                            onChange={(e) => setAnalyticsCourse(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg p-3 appearance-none focus:ring-1 focus:ring-primary outline-none"
                          >
                              {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                      </div>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Level / Dept</label>
                      <div className="relative">
                          <select className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg p-3 appearance-none focus:ring-1 focus:ring-primary outline-none">
                              <option>All Levels</option>
                              <option>100 Level</option>
                              <option>200 Level</option>
                              <option>300 Level</option>
                              <option>400 Level</option>
                              <option>500 Level</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                      </div>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block flex justify-between">
                          <span>Benchmark Alert</span>
                          <span className="text-primary font-bold">{analyticsBenchmark}%</span>
                      </label>
                      <div className="flex items-center gap-4">
                          <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={analyticsBenchmark}
                              onChange={(e) => setAnalyticsBenchmark(parseInt(e.target.value))}
                              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                      </div>
                  </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
                      <p className="text-zinc-500 text-xs uppercase font-medium">Average Attendance</p>
                      <div className="flex items-end gap-2 mt-2">
                          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{avgAttendance}%</h3>
                          {avgAttendance > analyticsBenchmark ? 
                             <TrendingUp size={20} className="text-green-500 mb-1" /> : 
                             <TrendingDown size={20} className="text-red-500 mb-1" />
                          }
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">Across all students</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
                      <p className="text-zinc-500 text-xs uppercase font-medium">Students At Risk</p>
                      <div className="flex items-end gap-2 mt-2">
                          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{belowBenchmarkCount}</h3>
                          <AlertCircle size={20} className="text-red-500 mb-1" />
                      </div>
                      <p className="text-xs text-red-400 mt-1">Below {analyticsBenchmark}% attendance</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
                      <p className="text-zinc-500 text-xs uppercase font-medium">Good Standing</p>
                      <div className="flex items-end gap-2 mt-2">
                          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{aboveBenchmarkCount}</h3>
                          <CheckCircle2 size={20} className="text-green-500 mb-1" />
                      </div>
                      <p className="text-xs text-green-400 mt-1">Above {analyticsBenchmark}% attendance</p>
                  </div>
              </div>

              {/* Student Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4">
                      <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                          <input 
                              type="text" 
                              placeholder="Search student by name or matric..." 
                              value={analyticsSearch}
                              onChange={(e) => setAnalyticsSearch(e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" 
                           />
                      </div>
                      <div className="text-sm text-zinc-500 hidden md:block">
                          Sorted by: Attendance (High to Low)
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                          <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800">
                              <tr>
                                  <th className="p-4 font-medium">Student Name</th>
                                  <th className="p-4 font-medium">Matric Number</th>
                                  <th className="p-4 font-medium">Classes Attended</th>
                                  <th className="p-4 font-medium">Attendance %</th>
                                  <th className="p-4 font-medium text-right">Status</th>
                              </tr>
                          </thead>
                          <tbody>
                              {filteredAnalytics.map((student) => {
                                  const isBelow = student.percentage < analyticsBenchmark;
                                  return (
                                      <tr key={student.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                          <td className="p-4 font-medium text-zinc-900 dark:text-white">{student.name}</td>
                                          <td className="p-4">{student.matric}</td>
                                          <td className="p-4">{student.attended} / {student.total}</td>
                                          <td className="p-4">
                                              <div className="flex items-center gap-2">
                                                  <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                      <div 
                                                          className={`h-full rounded-full ${isBelow ? 'bg-red-500' : 'bg-green-500'}`} 
                                                          style={{ width: `${student.percentage}%` }}
                                                      ></div>
                                                  </div>
                                                  <span className={isBelow ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{student.percentage}%</span>
                                              </div>
                                          </td>
                                          <td className="p-4 text-right">
                                              {isBelow ? (
                                                  <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
                                                      <AlertCircle size={12} /> At Risk
                                                  </span>
                                              ) : (
                                                  <span className="inline-flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">
                                                      <CheckCircle2 size={12} /> Good
                                                  </span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                              {filteredAnalytics.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                                          No students found matching your search.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  }

  // Default Dashboard View (Sessions)
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Hi, {userName}</h1>
          <p className="text-zinc-500">Manage your classes and track attendance.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Create Session
        </Button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
            { label: "Total Sessions", value: "124", icon: <Calendar size={20} className="text-blue-400" /> },
            { label: "Avg. Attendance", value: "85%", icon: <Users size={20} className="text-green-400" /> },
            { label: "Active Now", value: sessions.filter(s => s.active && !isSessionExpired(s.endTime)).length.toString(), icon: <Clock size={20} className="text-primary" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm text-zinc-500">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Sessions</h2>
            <div className="flex items-center gap-2 text-sm">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex p-1">
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>All</button>
                    <button onClick={() => setFilter('active')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'active' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Active</button>
                    <button onClick={() => setFilter('inactive')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'inactive' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Expired</button>
                </div>
                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <ArrowUpDown size={18} />
                </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No sessions found.</div>
            ) : (
                filteredSessions.map((session, idx) => {
                    const isExpanded = selectedSessionId === session.id;
                    const attendeesList = getMockAttendees(session.attendees);
                    const stats = getSessionStats(session);
                    const isExpired = isSessionExpired(session.endTime);
                    const timeRemaining = Math.max(0, new Date(session.endTime).getTime() - now.getTime());
                    const minutesLeft = Math.floor(timeRemaining / 60000);
                    
                    const chartData = [
                        { name: 'Present', value: stats.presentPercentage, count: stats.present, fill: '#22c55e' },
                        { name: 'Late', value: stats.latePercentage, count: stats.late, fill: '#eab308' },
                        { name: 'Absent', value: Math.round((stats.absent / stats.totalStudents) * 100), count: stats.absent, fill: '#ef4444' },
                    ];

                    return (
                        <div key={session.id} className={`${idx !== filteredSessions.length - 1 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''} ${isExpired ? 'opacity-75' : ''}`}>
                            <div 
                                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/30' : ''}`}
                                onClick={() => setSelectedSessionId(isExpanded ? null : session.id)}
                            >
                                <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isExpired ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-primary/10 text-primary'}`}>
                                    <QrCode size={24} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900 dark:text-white">{session.courseName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{session.courseCode}</span>
                                    <span>•</span>
                                    <span>{new Date(session.startTime).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {!isExpired && (
                                        <div className="hidden sm:flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                            <Timer size={14} />
                                            {minutesLeft}m left
                                        </div>
                                    )}
                                    {isExpired && (
                                         <div className="hidden sm:flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-xs font-bold">
                                            <AlertOctagon size={14} />
                                            Expired
                                        </div>
                                    )}
                                    <div className="text-right hidden sm:block">
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{session.attendees}</div>
                                        <div className="text-xs text-zinc-500">Attendees</div>
                                    </div>
                                    <button onClick={(e) => handleDeleteClick(e, session.id)} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2">
                                    {/* Exact Timings */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Start Time</p>
                                            <p className="text-zinc-900 dark:text-white font-medium flex items-center gap-2">
                                                <Clock size={14} className="text-green-500" />
                                                {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Status</p>
                                            <p className="font-medium flex items-center gap-2">
                                                {isExpired ? (
                                                    <span className="text-red-500 flex items-center gap-1"><AlertOctagon size={14} /> Expired</span>
                                                ) : (
                                                    <span className="text-green-500 flex items-center gap-1"><Timer size={14} /> Active</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Session Stats Visual Chart */}
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl mb-6">
                                        <h4 className="text-xs text-zinc-500 uppercase font-medium mb-4">Session Statistics</h4>
                                        <div className="h-40 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={60} tick={{fill: '#71717a', fontSize: 12}} axisLine={false} tickLine={false} />
                                                    <Tooltip 
                                                        cursor={{fill: 'transparent'}}
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 rounded shadow-lg text-xs">
                                                                        <p className="text-zinc-900 dark:text-white font-bold">{data.name}</p>
                                                                        <p className="text-zinc-500 dark:text-zinc-400">Count: {data.count}</p>
                                                                        <p className="text-zinc-500 dark:text-zinc-400">Percentage: {data.value}%</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex justify-between mt-2 px-2 text-xs text-zinc-500">
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Present: {stats.present}</div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Late: {stats.late}</div>
                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent: {stats.absent}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                        {/* Session Info Box */}
                                        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-zinc-500">Session Code</p>
                                                <p className={`text-xl font-mono font-bold tracking-widest ${isExpired ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-white'}`}>{session.sessionCode}</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(session.sessionCode);
                                                    alert("Code copied!");
                                                }}
                                                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-2"
                                                disabled={isExpired}
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => setIsScannerOpen(true)} disabled={isExpired}>
                                                <Camera size={16} className="mr-2" />
                                                Scan Student ID
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => setQrModalSession(session)} disabled={isExpired}>
                                                <QrCode size={16} className="mr-2" />
                                                {isExpired ? 'Session Expired' : 'Show Class QR'}
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Attendee List</h4>
                                    <div className="space-y-2">
                                        {attendeesList.map(att => (
                                            <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                        {att.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{att.name}</p>
                                                        <p className="text-xs text-zinc-500">{att.matricNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${att.status === 'present' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                        {att.status}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">{att.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-2 text-xs text-primary hover:underline">View Full List</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Weekly Overview</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl h-[300px] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Mon', attendees: 40 }, { name: 'Tue', attendees: 55 }, { name: 'Wed', attendees: 48 }, { name: 'Thu', attendees: 60 }, { name: 'Fri', attendees: 38 }]}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#71717a', opacity: 0.1 }} />
                <Bar dataKey="attendees" fill="#ffca0d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Create New Session</h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X size={20}/></button>
                </div>
                <form onSubmit={handleCreateSession} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Select Course</label>
                        <select 
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                            value={createSessionData.courseId}
                            onChange={(e) => setCreateSessionData({...createSessionData, courseId: e.target.value})}
                            required
                        >
                            <option value="" disabled>Select a course...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Select Venue</label>
                        <select 
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                            value={createSessionData.venueId}
                            onChange={(e) => setCreateSessionData({...createSessionData, venueId: e.target.value})}
                            required
                        >
                             <option value="" disabled>Select a venue...</option>
                             {venues.map(venue => (
                                 <option key={venue.id} value={venue.id}>{venue.name}</option>
                             ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Duration</label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                min="1"
                                className="flex-1" 
                                placeholder="60" 
                                value={createSessionData.durationValue} 
                                onChange={e => setCreateSessionData({...createSessionData, durationValue: e.target.value})} 
                                required 
                            />
                            <select 
                                className="w-1/3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                                value={createSessionData.durationUnit}
                                onChange={(e) => setCreateSessionData({...createSessionData, durationUnit: e.target.value as any})}
                            >
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                            </select>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Session will auto-expire after this time.</p>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">Create & Start</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-red-500/10 p-3 rounded-full text-red-500"><Trash2 size={24} /></div>
                    <div><h3 className="text-lg font-bold text-zinc-900 dark:text-white">Delete Session?</h3><p className="text-sm text-zinc-500">This action cannot be undone.</p></div>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none" onClick={confirmDelete}>Delete</Button>
                </div>
            </div>
        </div>
      )}
      <QRScannerModal />
      <SessionQRModal />
    </div>
  );
};