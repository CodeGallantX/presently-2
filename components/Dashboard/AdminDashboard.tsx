import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Users, Map as MapIcon, ShieldAlert, Activity, Search, MapPin, Settings, Plus, Edit2, Trash2, CheckCircle, XCircle, FileText, Filter, AlertTriangle, Info, Clock, Download, X, Layers, CreditCard, Building2 } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Switch } from '../Switch';
import InstitutionManagement from '../Admin/InstitutionManagement';
import Map, { Marker, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl, Source, Layer, MapRef } from 'react-map-gl';
import * as maplibregl from 'maplibre-gl';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Robustly resolve the mapLib instance
const mapLib = (maplibregl as any).default || maplibregl;

if (mapLib && typeof mapLib === 'object') {
    try {
        (mapLib as any).workerUrl = "https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl-csp-worker.js";
    } catch (e) {
        console.warn("Failed to configure maplibre workerUrl:", e);
    }
}

interface AdminDashboardProps {
  userName: string;
  view?: string;
}

// Local Types for Admin Views
interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Lecturer' | 'Admin' | 'Class Rep';
    status: 'Active' | 'Inactive';
    lastActive: string;
}

interface Venue {
    id: string;
    name: string;
    capacity: number;
    geofenceType: 'circle' | 'polygon';
    radius: number; // in meters (used if circle)
    polygonCoordinates?: [number, number][]; // Array of [lng, lat] (used if polygon)
    status: 'Active' | 'Maintenance';
    lat: number;
    lng: number;
}

interface SystemLog {
    id: string;
    action: string;
    user: string;
    role: string;
    timestamp: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

// Helper to create a GeoJSON circle
const createGeoJSONCircle = (center: [number, number], radiusInMeters: number, points = 64) => {
    const coords = {
        latitude: center[1],
        longitude: center[0]
    };

    const km = radiusInMeters / 1000;

    const ret = [];
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    let theta, x, y;
    for (let i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);

        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [ret]
        },
        properties: {}
    };
};

// Helper for Polygon GeoJSON
const createGeoJSONPolygon = (coordinates: [number, number][]) => {
    if (!coordinates || coordinates.length < 3) return null;
    // Ensure closed loop
    const closedCoords = [...coordinates];
    if (closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] || closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]) {
        closedCoords.push(closedCoords[0]);
    }
    
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [closedCoords]
        },
        properties: {}
    };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName, view = 'dashboard' }) => {
  // --- State Management ---
  
  // System Config State
  const [paymentGatewayEnabled, setPaymentGatewayEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('PAYMENT_GATEWAY_ENABLED');
    setPaymentGatewayEnabled(stored === 'true');
  }, []);

  const togglePaymentGateway = (checked: boolean) => {
    setPaymentGatewayEnabled(checked);
    localStorage.setItem('PAYMENT_GATEWAY_ENABLED', String(checked));
  };

  // Users State
  const [users, setUsers] = useState<AdminUser[]>([
      { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.j@uni.edu', role: 'Lecturer', status: 'Active', lastActive: '2 mins ago' },
      { id: '2', name: 'John Doe', email: 'john.d@uni.edu', role: 'Student', status: 'Active', lastActive: '1 hour ago' },
      { id: '3', name: 'Admin User', email: 'admin@uni.edu', role: 'Admin', status: 'Active', lastActive: 'Just now' },
      { id: '4', name: 'Jane Smith', email: 'jane.s@uni.edu', role: 'Student', status: 'Inactive', lastActive: '3 days ago' },
  ]);
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Venues State
  // Default coordinates for Ikorodu / LASUSTECH
  const [venues, setVenues] = useState<Venue[]>([
      { id: '1', name: '700 Seater Auditorium', capacity: 700, geofenceType: 'circle', radius: 25, status: 'Active', lat: 6.644830, lng: 3.513470 },
      { id: '2', name: 'School of Agriculture', capacity: 150, geofenceType: 'circle', radius: 20, status: 'Active', lat: 6.645500, lng: 3.514200 },
      { id: '3', name: 'Engineering Workshop', capacity: 100, geofenceType: 'polygon', radius: 0, polygonCoordinates: [[3.512700, 6.643800], [3.512900, 6.643800], [3.512900, 6.644000], [3.512700, 6.644000]], status: 'Maintenance', lat: 6.643900, lng: 3.512800 },
  ]);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  
  // Form State for Venues
  const [venueFormData, setVenueFormData] = useState({
      name: '',
      capacity: '',
      radius: '',
      lat: 6.644830,
      lng: 3.513470,
      status: 'Active',
      geofenceType: 'circle' as 'circle' | 'polygon',
      // Simple mock for polygon input (comma separated coords)
      polygonInput: '' 
  });

  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 3.513470,
    latitude: 6.644830,
    zoom: 16
  });

  // GeoJSON data
  const venueGeoJSON = useMemo(() => {
      const features = venues.map(v => {
          if (v.geofenceType === 'polygon' && v.polygonCoordinates) {
              return createGeoJSONPolygon(v.polygonCoordinates);
          } else {
              return createGeoJSONCircle([v.lng, v.lat], v.radius);
          }
      }).filter(Boolean); // remove nulls

      return {
          type: 'FeatureCollection',
          features: features
      };
  }, [venues]);

  // Logs State (Mock Data)
  const logs: SystemLog[] = [
      { id: '1', action: 'User Login', user: 'Dr. Sarah Johnson', role: 'Lecturer', timestamp: '10:42 AM', type: 'info' },
      { id: '2', action: 'Failed Login Attempt', user: 'Unknown IP', role: '-', timestamp: '10:40 AM', type: 'warning' },
      { id: '3', action: 'System Config Update', user: 'Admin User', role: 'Admin', timestamp: '09:15 AM', type: 'success' },
      { id: '4', action: 'Database Backup', user: 'System', role: 'System', timestamp: '02:00 AM', type: 'info' },
  ];

  // Activity Chart Data
  const activityData = [
    { name: 'Mon', active: 1200, sessions: 450 },
    { name: 'Tue', active: 1900, sessions: 680 },
    { name: 'Wed', active: 1500, sessions: 520 },
    { name: 'Thu', active: 2100, sessions: 790 },
    { name: 'Fri', active: 1800, sessions: 650 },
    { name: 'Sat', active: 400, sessions: 120 },
    { name: 'Sun', active: 300, sessions: 80 },
  ];

  // --- Handlers ---

  const handleDeleteUser = (id: string) => {
      if(confirm('Are you sure you want to delete this user?')) {
          setUsers(users.filter(u => u.id !== id));
      }
  };

  const handleSaveUser = (e: React.FormEvent) => {
      e.preventDefault();
      setIsUserModalOpen(false);
      setEditingUser(null);
  };

  // Venue Logic
  const openVenueModal = (venue?: Venue) => {
      if (venue) {
          setEditingVenue(venue);
          setVenueFormData({
              name: venue.name,
              capacity: venue.capacity.toString(),
              radius: venue.radius.toString(),
              lat: venue.lat,
              lng: venue.lng,
              status: venue.status,
              geofenceType: venue.geofenceType,
              polygonInput: venue.polygonCoordinates ? venue.polygonCoordinates.map(p => p.join(',')).join('; ') : ''
          });
          
          setViewState({
              longitude: venue.lng,
              latitude: venue.lat,
              zoom: 18
          });
      } else {
          setEditingVenue(null);
          // Don't reset viewstate on new add, keep user context
          setVenueFormData(prev => ({
              ...prev,
              name: '',
              capacity: '',
              radius: '30',
              lat: viewState.latitude,
              lng: viewState.longitude,
              status: 'Active',
              geofenceType: 'circle',
              polygonInput: ''
          }));
      }
      setIsVenueModalOpen(true);
  };

  const handleSaveVenue = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Parse polygon input if needed
      let polyCoords: [number, number][] = [];
      if (venueFormData.geofenceType === 'polygon' && venueFormData.polygonInput) {
          try {
              polyCoords = venueFormData.polygonInput.split(';').map(pair => {
                  const [lng, lat] = pair.trim().split(',').map(Number);
                  return [lng, lat] as [number, number];
              });
          } catch (err) {
              alert("Invalid polygon coordinates format. Use: lng,lat; lng,lat");
              return;
          }
      }

      if (editingVenue) {
          setVenues(prev => prev.map(v => v.id === editingVenue.id ? {
              ...v,
              ...venueFormData,
              capacity: parseInt(venueFormData.capacity) || 0,
              radius: parseInt(venueFormData.radius) || 0,
              status: venueFormData.status as any,
              polygonCoordinates: polyCoords.length ? polyCoords : undefined
          } : v));
      } else {
          const newVenue: Venue = {
              id: Date.now().toString(),
              ...venueFormData,
              capacity: parseInt(venueFormData.capacity) || 0,
              radius: parseInt(venueFormData.radius) || 0,
              status: venueFormData.status as any,
              polygonCoordinates: polyCoords.length ? polyCoords : undefined
          };
          setVenues(prev => [...prev, newVenue]);
      }
      setIsVenueModalOpen(false);
      setEditingVenue(null);
  };

  const handleDeleteVenue = (id: string) => {
     if(confirm('Are you sure you want to remove this venue?')) {
         setVenues(prev => prev.filter(v => v.id !== id));
     }
  };

  const handleMapClick = (e: any) => {
      const { lng, lat } = e.lngLat;
      setVenueFormData(prev => ({
          ...prev,
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6))
      }));
  };

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // --- Render Views ---

  // 1. Institution Management View
  if (view === 'institutions') {
    return <InstitutionManagement />;
  }

  // 2. User Management View
  if (view === 'users') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">User Management</h2>
                    <p className="text-zinc-500">Manage students, lecturers, and staff accounts.</p>
                  </div>
                  <Button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}>
                      <Plus size={18} className="mr-2"/> Add User
                  </Button>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                      <Input 
                        placeholder="Search by name or email..." 
                        icon={<Search size={16}/>} 
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                  </div>
                  <div className="flex gap-2">
                      <select className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none">
                          <option>All Roles</option>
                          <option>Student</option>
                          <option>Lecturer</option>
                          <option>Admin</option>
                      </select>
                      <Button variant="secondary" className="px-3"><Filter size={18}/></Button>
                  </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                        <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Last Active</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-500">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-zinc-900 dark:text-white font-medium">{user.name}</p>
                                                <p className="text-xs text-zinc-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border
                                            ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                                              user.role === 'Lecturer' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                              'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="p-4">{user.lastActive}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }}
                                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-1.5 hover:bg-red-500/10 rounded text-zinc-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-500 flex justify-between items-center">
                      <span>Showing {filteredUsers.length} users</span>
                      <div className="flex gap-2">
                          <Button variant="secondary" size="sm" disabled>Previous</Button>
                          <Button variant="secondary" size="sm">Next</Button>
                      </div>
                  </div>
              </div>

              {/* User Modal */}
              {isUserModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                              <button onClick={() => setIsUserModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X size={20}/></button>
                          </div>
                          <form onSubmit={handleSaveUser} className="space-y-4">
                              <Input label="Full Name" placeholder="e.g. John Doe" defaultValue={editingUser?.name} required />
                              <Input label="Email Address" type="email" placeholder="e.g. john@uni.edu" defaultValue={editingUser?.email} required />
                              <div>
                                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Role</label>
                                  <select className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary">
                                      <option selected={editingUser?.role === 'Student'}>Student</option>
                                      <option selected={editingUser?.role === 'Lecturer'}>Lecturer</option>
                                      <option selected={editingUser?.role === 'Class Rep'}>Class Rep</option>
                                      <option selected={editingUser?.role === 'Admin'}>Admin</option>
                                  </select>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Account Status</span>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs text-zinc-900 dark:text-white">{editingUser?.status || 'Active'}</span>
                                      <Switch checked={editingUser?.status !== 'Inactive'} onCheckedChange={() => {}} />
                                  </div>
                              </div>
                              <div className="pt-2 flex gap-3">
                                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                                  <Button type="submit" className="flex-1">Save Changes</Button>
                              </div>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // 2. Venue Management View
  if (view === 'venues') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Venue Management</h2>
                    <p className="text-zinc-500">Configure venues, capacities, and precise geofences.</p>
                  </div>
                  <Button onClick={() => openVenueModal()}>
                      <Plus size={18} className="mr-2"/> Add Venue
                  </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Interactive Map */}
                  <div className="lg:col-span-2 relative h-[600px] bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden group z-0">
                      
                      <Map
                        ref={mapRef}
                        {...viewState}
                        onMove={evt => setViewState(evt.viewState)}
                        onClick={handleMapClick}
                        style={{width: '100%', height: '100%'}}
                        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                        mapLib={mapLib as any} 
                        cursor='crosshair'
                      >
                          <NavigationControl position="top-right" />
                          <FullscreenControl position="top-right" />
                          <GeolocateControl position="top-right" />
                          <ScaleControl />

                          {/* Render Venue Markers */}
                          {venues.map(venue => (
                              <Marker 
                                key={venue.id} 
                                longitude={venue.lng} 
                                latitude={venue.lat} 
                                anchor="bottom"
                                onClick={(e) => {
                                    e.originalEvent.stopPropagation();
                                    openVenueModal(venue);
                                }}
                              >
                                  <div className="group cursor-pointer">
                                      <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${venue.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                          <MapPin size={12} className="text-white" />
                                      </div>
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                          {venue.name}
                                      </div>
                                  </div>
                              </Marker>
                          ))}

                          {/* Render Geofence Boundaries (Circles & Polygons) */}
                          {/* @ts-ignore */}
                          <Source id="venue-boundaries" type="geojson" data={venueGeoJSON}>
                              <Layer 
                                id="venue-fill"
                                type="fill"
                                paint={{
                                    'fill-color': '#ffca0d',
                                    'fill-opacity': 0.15
                                }}
                              />
                              <Layer 
                                id="venue-outline"
                                type="line"
                                paint={{
                                    'line-color': '#ffca0d',
                                    'line-width': 2,
                                    'line-dasharray': [2, 1]
                                }}
                              />
                          </Source>
                      </Map>

                      <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-[1]">
                          <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between pointer-events-auto shadow-lg">
                              <div>
                                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2"><MapPin size={14} className="text-primary"/> Campus Map</h4>
                                  <p className="text-[10px] text-zinc-500">Click map to set center point.</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] text-zinc-500 font-mono">LAT: {venueFormData.lat}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono">LNG: {venueFormData.lng}</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Venues List */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {venues.map(venue => (
                          <div 
                            key={venue.id} 
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors relative group cursor-pointer shadow-sm"
                            onClick={() => {
                                setViewState({
                                    latitude: venue.lat,
                                    longitude: venue.lng,
                                    zoom: 18
                                });
                            }}
                          >
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{venue.name}</h3>
                                      <p className="text-xs text-zinc-500 font-mono flex items-center gap-1 mt-1">
                                          <MapPin size={10} /> {venue.lat}, {venue.lng}
                                      </p>
                                  </div>
                                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${venue.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                      {venue.status}
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg">
                                      <p className="text-xs text-zinc-500">Capacity</p>
                                      <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1"><Users size={12}/> {venue.capacity}</p>
                                  </div>
                                  <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg">
                                      <p className="text-xs text-zinc-500">Geofence</p>
                                      <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                                          {venue.geofenceType === 'circle' ? <Activity size={12}/> : <Layers size={12}/>} 
                                          {venue.geofenceType === 'circle' ? `${venue.radius}m Radius` : 'Polygon'}
                                      </p>
                                  </div>
                              </div>

                              <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openVenueModal(venue);
                                    }}
                                  >
                                    <Edit2 size={14} className="mr-1" /> Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="px-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVenue(venue.id);
                                    }}
                                  >
                                      <Trash2 size={16} />
                                  </Button>
                              </div>
                          </div>
                      ))}
                      {venues.length === 0 && (
                          <div className="text-center p-8 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                              <MapIcon size={32} className="mx-auto mb-2 opacity-50" />
                              <p>No venues configured.</p>
                              <Button variant="ghost" size="sm" className="mt-2" onClick={() => openVenueModal()}>Create One</Button>
                          </div>
                      )}
                  </div>
              </div>

              {/* Venue Modal */}
              {isVenueModalOpen && (
                  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{editingVenue ? 'Edit Venue' : 'Add New Venue'}</h3>
                              <button onClick={() => setIsVenueModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X size={20}/></button>
                          </div>
                          <form onSubmit={handleSaveVenue} className="space-y-4">
                              <Input 
                                label="Venue Name" 
                                placeholder="e.g. Lecture Hall 1" 
                                value={venueFormData.name}
                                onChange={e => setVenueFormData({...venueFormData, name: e.target.value})}
                                required 
                              />
                              <Input 
                                label="Capacity" 
                                type="number" 
                                placeholder="200" 
                                value={venueFormData.capacity}
                                onChange={e => setVenueFormData({...venueFormData, capacity: e.target.value})}
                                required 
                              />
                              
                              <div>
                                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Geofence Type</label>
                                  <select 
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                                    value={venueFormData.geofenceType}
                                    onChange={(e) => setVenueFormData({...venueFormData, geofenceType: e.target.value as any})}
                                  >
                                      <option value="circle">Circular Radius (Simple)</option>
                                      <option value="polygon">Custom Polygon (Precise)</option>
                                  </select>
                              </div>

                              {venueFormData.geofenceType === 'circle' ? (
                                  <Input 
                                    label="Geofence Radius (m)" 
                                    type="number" 
                                    placeholder="50" 
                                    value={venueFormData.radius}
                                    onChange={e => setVenueFormData({...venueFormData, radius: e.target.value})}
                                    required 
                                  />
                              ) : (
                                  <div>
                                      <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Polygon Coordinates</label>
                                      <textarea 
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-sm focus:ring-primary focus:border-primary h-24 font-mono text-xs"
                                        placeholder="lng,lat; lng,lat; lng,lat..."
                                        value={venueFormData.polygonInput}
                                        onChange={e => setVenueFormData({...venueFormData, polygonInput: e.target.value})}
                                      />
                                      <p className="text-[10px] text-zinc-500 mt-1">Format: longitude,latitude separated by semicolons.</p>
                                  </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Center Latitude" 
                                    type="number"
                                    step="0.000001"
                                    value={venueFormData.lat.toString()}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setVenueFormData({...venueFormData, lat: val});
                                        setViewState(prev => ({...prev, latitude: val}));
                                    }}
                                />
                                <Input 
                                    label="Center Longitude"
                                    type="number" 
                                    step="0.000001"
                                    value={venueFormData.lng.toString()}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setVenueFormData({...venueFormData, lng: val});
                                        setViewState(prev => ({...prev, longitude: val}));
                                    }}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Venue Status</span>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs text-zinc-900 dark:text-white">{venueFormData.status}</span>
                                      <Switch 
                                        checked={venueFormData.status === 'Active'} 
                                        onCheckedChange={(checked) => setVenueFormData({...venueFormData, status: checked ? 'Active' : 'Maintenance'})} 
                                      />
                                  </div>
                              </div>

                              <div className="pt-2 flex gap-3">
                                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsVenueModalOpen(false)}>Cancel</Button>
                                  <Button type="submit" className="flex-1">Save Venue</Button>
                              </div>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // 3. Audit Logs View
  if (view === 'logs') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">System Logs</h2>
                    <p className="text-zinc-500">Track system activities and security events.</p>
                  </div>
                  <div className="flex gap-2">
                      <Button variant="secondary" size="sm"><Download size={16} className="mr-2"/> Export CSV</Button>
                  </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                          <input type="text" placeholder="Search logs..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <select className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-3 focus:ring-primary focus:border-primary outline-none">
                          <option>All Events</option>
                          <option>Info</option>
                          <option>Warnings</option>
                          <option>Errors</option>
                      </select>
                  </div>
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                      <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200">
                          <tr>
                              <th className="p-4 font-medium">Type</th>
                              <th className="p-4 font-medium">Action</th>
                              <th className="p-4 font-medium">User</th>
                              <th className="p-4 font-medium">Role</th>
                              <th className="p-4 font-medium text-right">Timestamp</th>
                          </tr>
                      </thead>
                      <tbody>
                          {logs.map(log => (
                              <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                  <td className="p-4">
                                      {log.type === 'info' && <Info size={18} className="text-blue-500" />}
                                      {log.type === 'warning' && <AlertTriangle size={18} className="text-yellow-500" />}
                                      {log.type === 'error' && <XCircle size={18} className="text-red-500" />}
                                      {log.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                                  </td>
                                  <td className="p-4 text-zinc-900 dark:text-white font-medium">{log.action}</td>
                                  <td className="p-4">{log.user}</td>
                                  <td className="p-4">
                                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">{log.role}</span>
                                  </td>
                                  <td className="p-4 text-right font-mono text-xs">{log.timestamp}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }

  // 4. Default Admin Dashboard Overview
  return (
    <div className="space-y-8 animate-in fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-zinc-500">System overview and health check.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary">View Reports</Button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[
                 { label: "Total Users", value: "2,543", icon: Users, color: "text-blue-500" },
                 { label: "Active Venues", value: "12", icon: MapIcon, color: "text-green-500" },
                 { label: "Total Sessions", value: "8,921", icon: Activity, color: "text-yellow-500" },
                 { label: "Security Alerts", value: "3", icon: ShieldAlert, color: "text-red-500" },
             ].map((stat, i) => (
                 <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl flex items-center justify-between shadow-sm">
                     <div>
                         <p className="text-sm text-zinc-500">{stat.label}</p>
                         <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</p>
                     </div>
                     <div className={`p-3 bg-zinc-100 dark:bg-zinc-950 rounded-lg ${stat.color}`}>
                         <stat.icon size={20} />
                     </div>
                 </div>
             ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-zinc-900 dark:text-white mb-4">System Activity</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffca0d" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ffca0d" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="active" stroke="#ffca0d" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} name="Active Users" />
                            <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2} name="Sessions" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="space-y-6">
                 {/* System Controls Card */}
                 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">System Controls</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2"><CreditCard size={14}/> Payment Gateway</p>
                                <p className="text-xs text-zinc-500">Enable/Disable onboarding payments.</p>
                            </div>
                            <Switch checked={paymentGatewayEnabled} onCheckedChange={togglePaymentGateway} />
                        </div>
                    </div>
                </div>

                 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Recent Alerts</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">Suspicious Login Detected</p>
                                <p className="text-xs text-zinc-500">Multiple failed attempts from IP 192.168.1.1</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <Info size={18} className="text-yellow-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">High Server Load</p>
                                <p className="text-xs text-zinc-500">CPU usage exceeded 85% for 5 mins.</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};