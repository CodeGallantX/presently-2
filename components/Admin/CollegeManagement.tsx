import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Search, Filter, Users, Building2, AlertCircle, Loader, ArrowLeft, Mail, Phone } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution, College } from '../../types';
import { getCollegesByInstitution, createCollege, updateCollege, deleteCollege } from '../../services/supabase/institutions';
import CollegeModal from './CollegeModal';

interface CollegeManagementProps {
  institution: Institution;
  onBack: () => void;
}

export const CollegeManagement: React.FC<CollegeManagementProps> = ({
  institution,
  onBack
}) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  // Load colleges
  useEffect(() => {
    loadColleges();
  }, [institution.id]);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await getCollegesByInstitution(institution.id);
      setColleges(data);
      setError(null);
    } catch (err) {
      setError('Failed to load colleges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter colleges
  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCollege = () => {
    setEditingCollege(null);
    setShowCollegeModal(true);
  };

  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setShowCollegeModal(true);
  };

  const handleSaveCollege = async (formData: Partial<College>) => {
    try {
      if (editingCollege) {
        await updateCollege(editingCollege.id, formData);
      } else {
        await createCollege({
          ...formData,
          institution_id: institution.id,
          total_departments: 0,
          total_students: 0,
          total_lecturers: 0,
          is_active: true
        } as Omit<College, 'id' | 'created_at' | 'updated_at'>);
      }
      await loadColleges();
      setShowCollegeModal(false);
    } catch (err) {
      setError('Failed to save college');
      console.error(err);
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm('Are you sure you want to delete this college? This will also delete all associated departments.')) {
      return;
    }
    
    try {
      await deleteCollege(id);
      await loadColleges();
    } catch (err) {
      setError('Failed to delete college');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Institutions</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">College Management</h1>
              <p className="text-sm text-zinc-400 mt-1">{institution.full_name}</p>
            </div>
          </div>
          <Button onClick={handleCreateCollege} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add College
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
            <Input
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-zinc-400 flex items-center justify-end">
            {filteredColleges.length} college(ies)
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

      {/* Colleges Table */}
      {!loading && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">College Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Dean</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredColleges.map((college) => (
                  <tr key={college.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      <div>
                        <p>{college.name}</p>
                        <p className="text-xs text-zinc-500">{college.abbreviation}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                        {college.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      <div>
                        <p>{college.dean_name || 'N/A'}</p>
                        {college.dean_email && (
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {college.dean_email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      <div>
                        {college.contact_email && (
                          <p className="text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {college.contact_email}
                          </p>
                        )}
                        {college.contact_phone && (
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {college.contact_phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        college.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {college.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleEditCollege(college)}
                          variant="secondary"
                          className="px-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteCollege(college.id)}
                          variant="secondary"
                          className="px-3 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredColleges.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No colleges found</p>
              <p className="text-zinc-500 text-sm mt-2">Create a new college to get started</p>
            </div>
          )}
        </div>
      )}

      {/* College Modal */}
      {showCollegeModal && (
        <CollegeModal
          institution={institution}
          college={editingCollege || undefined}
          onSave={handleSaveCollege}
          onClose={() => {
            setShowCollegeModal(false);
            setEditingCollege(null);
          }}
        />
      )}
    </div>
  );
};

export default CollegeManagement;
