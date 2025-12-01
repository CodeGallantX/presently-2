import React, { useState, useRef } from 'react';
import { StudentDashboard } from './StudentDashboard';
import { Button } from '../Button';
import { Users, CheckCircle2, XCircle, Search, FileText, Calendar, Plus, Trash2, Clock, MapPin, Upload, Sparkles, Loader2, Save, X } from 'lucide-react';
import { Input } from '../Input';
import { analyzeTimetableImage } from '../../services/geminiService';

interface ClassRepDashboardProps {
  userName: string;
  view?: string;
}

interface TimetableEntry {
    id: string;
    courseCode: string;
    day: string;
    startTime: string;
    endTime: string;
    venue: string;
}

export const ClassRepDashboard: React.FC<ClassRepDashboardProps> = ({ userName, view = 'dashboard' }) => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([
      { id: '1', courseCode: 'CS402', day: 'Monday', startTime: '10:00', endTime: '12:00', venue: 'LH 1' },
      { id: '2', courseCode: 'CS301', day: 'Tuesday', startTime: '14:00', endTime: '16:00', venue: 'Lab 3' },
  ]);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [newEntry, setNewEntry] = useState({
      courseCode: '',
      day: 'Monday',
      startTime: '',
      endTime: '',
      venue: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddEntry = (e: React.FormEvent) => {
      e.preventDefault();
      const entry: TimetableEntry = {
          id: Date.now().toString(),
          ...newEntry
      };
      setTimetable([...timetable, entry]);
      setIsTimetableModalOpen(false);
      setNewEntry({ courseCode: '', day: 'Monday', startTime: '', endTime: '', venue: '' });
  };

  const handleDeleteEntry = (id: string) => {
      setTimetable(timetable.filter(t => t.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsScanning(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          if (event.target?.result) {
              try {
                  const base64 = event.target.result as string;
                  const scannedEntries = await analyzeTimetableImage(base64);
                  
                  if (scannedEntries && Array.isArray(scannedEntries)) {
                      const newEntries = scannedEntries.map((entry: any) => ({
                          id: Date.now().toString() + Math.random().toString(),
                          courseCode: entry.courseCode || 'Unknown',
                          day: entry.day || 'Monday',
                          startTime: entry.startTime || '09:00',
                          endTime: entry.endTime || '10:00',
                          venue: entry.venue || 'TBA'
                      }));
                      setTimetable(prev => [...prev, ...newEntries]);
                      setIsAiScanOpen(false);
                  }
              } catch (error) {
                  alert("Failed to scan timetable. Please try again.");
              } finally {
                  setIsScanning(false);
              }
          }
      };
      reader.readAsDataURL(file);
  };

  const handleSaveTimetable = () => {
      // Mock save functionality
      alert("Timetable saved successfully!");
  };

  // If view is dashboard/history, reuse student view but with extra options
  if (view === 'dashboard' || view === 'history') {
      return (
          <div className="space-y-8">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                      <h3 className="text-primary font-bold">Class Representative Mode</h3>
                      <p className="text-xs text-zinc-400">You have extra privileges to manage class attendance and timetables.</p>
                  </div>
                  <Button size="sm" variant="outline">View Class Report</Button>
              </div>
              <StudentDashboard userName={userName} view={view} />
          </div>
      );
  }

  // Override Timetable view for Class Rep to allow editing
  if (view === 'timetable') {
      return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Manage Class Timetable</h2>
                    <p className="text-zinc-400">View, edit, or auto-generate your class schedule.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsAiScanOpen(true)}>
                        <Sparkles size={18} className="mr-2 text-primary"/> AI Scan
                    </Button>
                    <Button onClick={() => setIsTimetableModalOpen(true)}>
                        <Plus size={18} className="mr-2"/> Add Class
                    </Button>
                    <Button variant="outline" onClick={handleSaveTimetable}>
                        <Save size={18} className="mr-2"/> Save
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const dayEntries = timetable.filter(t => t.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                    return (
                        <div key={day} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                <Calendar size={18} /> {day}
                            </h3>
                            {dayEntries.length > 0 ? (
                                <div className="space-y-3">
                                    {dayEntries.map(entry => (
                                        <div key={entry.id} className="bg-zinc-950 p-4 rounded-lg flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-zinc-900 p-2 rounded text-zinc-400">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{entry.courseCode}</p>
                                                    <p className="text-sm text-zinc-500">{entry.startTime} - {entry.endTime}</p>
                                                </div>
                                                <div className="hidden md:flex items-center text-zinc-500 text-sm ml-4">
                                                    <MapPin size={14} className="mr-1" /> {entry.venue}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="text-zinc-500 hover:text-red-500 p-2 rounded hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-600 italic">No classes scheduled.</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Manual Entry Modal */}
            {isTimetableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Add Timetable Entry</h3>
                            <button onClick={() => setIsTimetableModalOpen(false)}><X size={20} className="text-zinc-500 hover:text-white"/></button>
                        </div>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <Input 
                                label="Course Code" 
                                placeholder="e.g. CS402" 
                                value={newEntry.courseCode} 
                                onChange={e => setNewEntry({...newEntry, courseCode: e.target.value})} 
                                required 
                            />
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Day</label>
                                <select 
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:ring-primary focus:border-primary"
                                    value={newEntry.day}
                                    onChange={e => setNewEntry({...newEntry, day: e.target.value})}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Start Time" 
                                    type="time" 
                                    value={newEntry.startTime} 
                                    onChange={e => setNewEntry({...newEntry, startTime: e.target.value})} 
                                    required 
                                />
                                <Input 
                                    label="End Time" 
                                    type="time" 
                                    value={newEntry.endTime} 
                                    onChange={e => setNewEntry({...newEntry, endTime: e.target.value})} 
                                    required 
                                />
                            </div>
                            <Input 
                                label="Venue" 
                                placeholder="e.g. LH 1" 
                                value={newEntry.venue} 
                                onChange={e => setNewEntry({...newEntry, venue: e.target.value})} 
                                required 
                            />
                            <div className="pt-2 flex gap-3">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsTimetableModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Add Class</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Scan Modal */}
            {isAiScanOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="flex justify-end">
                            <button onClick={() => setIsAiScanOpen(false)}><X size={20} className="text-zinc-500 hover:text-white"/></button>
                        </div>
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Scan Timetable</h3>
                            <p className="text-zinc-400 text-sm">Upload a photo of your class schedule, and AI will automatically extract the details.</p>
                        </div>
                        
                        {isScanning ? (
                            <div className="py-8">
                                <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
                                <p className="text-white font-medium">Analyzing Image...</p>
                                <p className="text-zinc-500 text-sm mt-1">This uses Gemini 3 Pro Vision</p>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl p-8 cursor-pointer hover:bg-zinc-900 hover:border-primary transition-all group"
                            >
                                <Upload size={32} className="text-zinc-500 group-hover:text-primary mx-auto mb-3 transition-colors" />
                                <p className="text-white font-medium">Click to Upload Image</p>
                                <p className="text-zinc-500 text-xs mt-1">Supports JPG, PNG</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileUpload} 
                                />
                            </div>
                        )}
                        <div className="mt-6 text-xs text-zinc-600">
                            Make sure the image is clear and the text is legible for best results.
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  if (view === 'class-mgmt') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <h2 className="text-2xl font-bold text-white">Class Management</h2>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">Mark Attendance for Absent Students</h3>
                  <div className="flex gap-4 mb-6">
                      <Input placeholder="Search student by name or matric..." icon={<Search size={16}/>} className="bg-zinc-950" />
                      <Button>Search</Button>
                  </div>
                  
                  <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 font-bold">JD</div>
                                  <div>
                                      <p className="text-white font-medium">John Doe</p>
                                      <p className="text-sm text-zinc-500">ENG/2021/00{i}</p>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" className="text-green-400 hover:text-green-300">
                                      <CheckCircle2 size={16} className="mr-2" /> Mark Present
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                                      <XCircle size={16} className="mr-2" /> Mark Absent
                                  </Button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">Class Reports</h3>
                  <p className="text-zinc-500 text-sm mb-4">Generate attendance sheets for lecturers.</p>
                  <Button variant="secondary" className="w-full justify-between">
                      <span>Download Weekly Summary (PDF)</span>
                      <FileText size={16} />
                  </Button>
              </div>
          </div>
      );
  }

  return <StudentDashboard userName={userName} />;
};
