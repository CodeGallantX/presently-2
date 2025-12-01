import React, { useState } from 'react';
import { UserRole } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, 
  BookOpen, Award, Clock, Edit2, Camera, Shield, Hash, Building,
  Check, Users, Globe, Link as LinkIcon
} from 'lucide-react';

interface ProfilePageProps {
  userRole: UserRole;
  userName: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userRole, userName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: userName,
    email: userName.toLowerCase().replace(' ', '.') + '@university.edu',
    phone: '+234 812 345 6789',
    location: 'Lagos, Nigeria',
    bio: 'Passionate about technology and education. Always learning something new.',
    // Role specific mocks
    matricNumber: 'ENG/21/0452',
    department: 'Computer Science',
    level: '400',
    cgpa: '4.52',
    staffId: 'LEC/CS/007',
    office: 'Faculty Block B, Rm 304',
    specialization: 'Artificial Intelligence'
  });

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case UserRole.ADMIN: return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case UserRole.LECTURER: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case UserRole.CLASS_REP: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
      <div className="flex items-center gap-2 mb-4">
          <Icon size={18} className="text-primary" />
          <h3 className="font-bold text-zinc-900 dark:text-white">{title}</h3>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Cover Image & Header */}
      <div className="relative mb-24">
         <div className="h-48 md:h-64 w-full rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700 dark:from-zinc-900 dark:to-zinc-800"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute inset-0 bg-primary/5"></div>
            <button className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                <Camera size={18} />
            </button>
         </div>
         
         {/* Profile Card Overlay */}
         <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                <div className="flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white dark:border-black bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative shadow-xl">
                             <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-900">
                                {userData.name.charAt(0)}
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-2 bg-primary text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                             <Camera size={16} />
                        </button>
                    </div>
                    <div className="mb-2 md:mb-4">
                        <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-1">{userData.name}</h1>
                        <div className="flex flex-wrap items-center gap-2">
                             <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getRoleBadgeColor()}`}>
                                {userRole.replace('_', ' ')}
                            </span>
                            <span className="text-zinc-500 text-sm flex items-center gap-1">
                                <MapPin size={12} /> {userData.location}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mb-2 md:mb-4 w-full md:w-auto flex justify-end">
                    {isEditing ? (
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1 md:flex-none">Cancel</Button>
                            <Button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none">Save Changes</Button>
                        </div>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full md:w-auto bg-white dark:bg-zinc-900 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <Edit2 size={16} className="mr-2" /> Edit Profile
                        </Button>
                    )}
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-0 md:px-4">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Intro / Bio Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <SectionTitle icon={User} title="About" />
                {isEditing ? (
                    <textarea 
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-300 focus:ring-1 focus:ring-primary outline-none resize-none"
                        rows={4}
                        value={userData.bio}
                        onChange={(e) => setUserData({...userData, bio: e.target.value})}
                    />
                ) : (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                        {userData.bio}
                    </p>
                )}
                
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Mail size={16} className="text-zinc-400" />
                        <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Phone size={16} className="text-zinc-400" />
                        <span>{userData.phone}</span>
                    </div>
                     <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <LinkIcon size={16} className="text-zinc-400" />
                        <a href="#" className="hover:text-primary transition-colors">university.edu/profile/jdoe</a>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                 <SectionTitle icon={Award} title="Overview" />
                 <div className="grid grid-cols-2 gap-4">
                     {(userRole === UserRole.STUDENT || userRole === UserRole.CLASS_REP) && (
                         <>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center">
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{userData.cgpa}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">CGPA</div>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center">
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">92%</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Attendance</div>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center">
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">6</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Courses</div>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center">
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{userData.level}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Level</div>
                            </div>
                         </>
                     )}
                      {userRole === UserRole.LECTURER && (
                         <>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center">
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">450+</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Students</div>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-center">
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">4.8</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Rating</div>
                            </div>
                         </>
                     )}
                 </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Detailed Info Form */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <SectionTitle icon={Briefcase} title="Academic Information" />
                
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-6 mt-6">
                     {(userRole === UserRole.STUDENT || userRole === UserRole.CLASS_REP) && (
                        <>
                            <Input label="Full Name" value={userData.name} disabled={!isEditing} onChange={(e) => setUserData({...userData, name: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Matriculation Number" value={userData.matricNumber} disabled className="opacity-70 bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Department" value={userData.department} disabled={!isEditing} onChange={(e) => setUserData({...userData, department: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Level" value={userData.level} disabled={!isEditing} onChange={(e) => setUserData({...userData, level: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Email Address" value={userData.email} disabled className="opacity-70 bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Phone Number" value={userData.phone} disabled={!isEditing} onChange={(e) => setUserData({...userData, phone: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                        </>
                     )}

                     {userRole === UserRole.LECTURER && (
                        <>
                            <Input label="Full Name" value={userData.name} disabled={!isEditing} onChange={(e) => setUserData({...userData, name: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Staff ID" value={userData.staffId} disabled className="opacity-70 bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Department" value={userData.department} disabled={!isEditing} onChange={(e) => setUserData({...userData, department: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Office Location" value={userData.office} disabled={!isEditing} onChange={(e) => setUserData({...userData, office: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <div className="md:col-span-2">
                                <Input label="Specialization" value={userData.specialization} disabled={!isEditing} onChange={(e) => setUserData({...userData, specialization: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            </div>
                        </>
                     )}
                     
                     {userRole === UserRole.ADMIN && (
                        <>
                            <Input label="Full Name" value={userData.name} disabled={!isEditing} onChange={(e) => setUserData({...userData, name: e.target.value})} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Admin Role" value="Super Administrator" disabled className="opacity-70 bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Department" value="IT Support" disabled={!isEditing} className="bg-zinc-50 dark:bg-zinc-950" />
                            <Input label="Clearance" value="Level 5" disabled className="opacity-70 bg-zinc-50 dark:bg-zinc-950" />
                        </>
                     )}
                </div>
            </div>

            {/* Recent Activity Stream */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <SectionTitle icon={Clock} title="Recent Activity" />
                    <Button variant="ghost" size="sm" className="text-zinc-500">View All</Button>
                </div>
                
                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-[2px] before:bg-zinc-100 dark:before:bg-zinc-800">
                    {[
                        { title: userRole === UserRole.STUDENT ? 'Attended CS402 Class' : 'Created CS402 Session', time: '2 hours ago', icon: Check },
                        { title: 'Updated Profile Information', time: '1 day ago', icon: Edit2 },
                        { title: 'Logged in from New Device', time: '3 days ago', icon: Shield },
                    ].map((activity, i) => (
                        <div key={i} className="flex gap-4 relative">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border-2 border-primary/20 flex items-center justify-center shrink-0 z-10">
                                <activity.icon size={16} className="text-primary" />
                            </div>
                            <div className="pt-2">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{activity.title}</p>
                                <p className="text-xs text-zinc-500 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};