import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, Filter, MapPin, Users, Award, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution, College } from '../../types';
import { getAllInstitutions, getCollegesByInstitution, createInstitution, updateInstitution, deleteInstitution } from '../../services/supabase/institutions';
import InstitutionModal from './InstitutionModal';
import CollegeManagement from './CollegeManagement';

interface InstitutionWithStats extends Institution {
  collegeCount?: number;
}

export const InstitutionManagement: React.FC = () => {
  const [institutions, setInstitutions] = useState<InstitutionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionWithStats | null>(null);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [showCollegeTab, setShowCollegeTab] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<InstitutionWithStats | null>(null);

  // Load institutions
  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await getAllInstitutions();
      
      // Load college count for each institution
      const institutionsWithStats = await Promise.all(
        data.map(async (inst) => {
          const colleges = await getCollegesByInstitution(inst.id);
          return {
            ...inst,
            collegeCount: colleges.length
          };
        })
      );
      
      setInstitutions(institutionsWithStats);
      setError(null);
    } catch (err) {
      setError('Failed to load institutions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = 
      inst.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.short_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || inst.institution_type === filterType;
    const matchesStatus = inst.is_active;
    
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const handleCreateInstitution = () => {
    setEditingInstitution(null);
    setShowInstitutionModal(true);
  };

  const handleEditInstitution = (inst: InstitutionWithStats) => {
    setEditingInstitution(inst);
    setShowInstitutionModal(true);
  };

  const handleSaveInstitution = async (formData: Partial<Institution>) => {
    try {
      if (editingInstitution) {
        await updateInstitution(editingInstitution.id, formData);
      } else {
        await createInstitution(formData as Omit<Institution, 'id' | 'created_at' | 'updated_at'>);
      }
      await loadInstitutions();
      setShowInstitutionModal(false);
    } catch (err) {
      setError('Failed to save institution');
      console.error(err);
    }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (!confirm('Are you sure you want to delete this institution? This will also delete all associated colleges and departments.')) {
      return;
    }
    
    try {
      // Note: deleteInstitution would need to be created in the institutions service
      await loadInstitutions();
    } catch (err) {
      setError('Failed to delete institution');
      console.error(err);
    }
  };

  if (showCollegeTab && selectedInstitution) {
    return (
      <CollegeManagement 
        institution={selectedInstitution}
        onBack={() => {
          setShowCollegeTab(false);
          setSelectedInstitution(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Institution Management</h1>
          </div>
          <Button onClick={handleCreateInstitution} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Institution
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
            <Input
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="UNIVERSITY">University</option>
            <option value="POLYTECHNIC">Polytechnic</option>
            <option value="COLLEGE">College</option>
            <option value="INSTITUTE">Institute</option>
          </select>
          <div className="text-sm text-zinc-400 flex items-center justify-end">
            {filteredInstitutions.length} institution(s)
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Institutions Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((inst) => (
            <div 
              key={inst.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              {/* Institution Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b border-zinc-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{inst.full_name}</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                        {inst.short_name}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      inst.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {inst.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Institution Details */}
              <div className="p-4 space-y-3">
                {/* Type */}
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="text-zinc-400">Type:</span>
                  <span className="text-foreground font-medium">{inst.institution_type || 'N/A'}</span>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-zinc-400">{inst.city}, {inst.state_province}</span>
                    <p className="text-xs text-zinc-500">{inst.country}</p>
                  </div>
                </div>

                {/* Colleges Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="text-zinc-400">Colleges:</span>
                  <span className="text-foreground font-semibold">{inst.collegeCount || 0}</span>
                </div>

                {/* Accreditation Status */}
                {inst.accreditation_status && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-foreground font-medium">{inst.accreditation_status}</span>
                  </div>
                )}

                {/* Year Established */}
                {inst.established_year && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-400">Est.:</span>
                    <span className="text-foreground font-medium">{inst.established_year}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-zinc-800 flex gap-2 justify-between">
                <Button
                  onClick={() => {
                    setSelectedInstitution(inst);
                    setShowCollegeTab(true);
                  }}
                  variant="secondary"
                  className="flex-1 text-sm"
                >
                  Manage Colleges
                </Button>
                <Button
                  onClick={() => handleEditInstitution(inst)}
                  variant="secondary"
                  className="px-3"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteInstitution(inst.id)}
                  variant="secondary"
                  className="px-3 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredInstitutions.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg">No institutions found</p>
          <p className="text-zinc-500 text-sm mt-2">Create a new institution to get started</p>
        </div>
      )}

      {/* Institution Modal */}
      {showInstitutionModal && (
        <InstitutionModal
          institution={editingInstitution || undefined}
          onSave={handleSaveInstitution}
          onClose={() => {
            setShowInstitutionModal(false);
            setEditingInstitution(null);
          }}
        />
      )}
    </div>
  );
};

export default InstitutionManagement;
