import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution, College } from '../../types';

interface CollegeModalProps {
  institution: Institution;
  college?: College;
  onSave: (data: Partial<College>) => Promise<void>;
  onClose: () => void;
}

export const CollegeModal: React.FC<CollegeModalProps> = ({
  institution,
  college,
  onSave,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<College>>({
    name: college?.name || '',
    code: college?.code || '',
    abbreviation: college?.abbreviation || '',
    description: college?.description || '',
    dean_name: college?.dean_name || '',
    dean_email: college?.dean_email || '',
    contact_email: college?.contact_email || '',
    contact_phone: college?.contact_phone || '',
    building_block: college?.building_block || '',
    office_location: college?.office_location || '',
    website_url: college?.website_url || '',
    established_year: college?.established_year || new Date().getFullYear(),
    is_active: college?.is_active !== false,
  });

  const handleChange = (field: keyof College, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      setError('College name is required');
      return;
    }
    if (!formData.code?.trim()) {
      setError('College code is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save college');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {college ? 'Edit College' : 'Create College'}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{institution.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    College Name *
                  </label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., College of Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    College Code *
                  </label>
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g., COS"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Abbreviation
                </label>
                <Input
                  value={formData.abbreviation || ''}
                  onChange={(e) => handleChange('abbreviation', e.target.value)}
                  placeholder="Alternative abbreviation"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the college"
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground text-sm placeholder-zinc-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Year Established
                </label>
                <Input
                  type="number"
                  value={formData.established_year || ''}
                  onChange={(e) => handleChange('established_year', parseInt(e.target.value))}
                  placeholder="e.g., 1970"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Dean Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Dean Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Dean Name
                  </label>
                  <Input
                    value={formData.dean_name || ''}
                    onChange={(e) => handleChange('dean_name', e.target.value)}
                    placeholder="e.g., Prof. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Dean Email
                  </label>
                  <Input
                    type="email"
                    value={formData.dean_email || ''}
                    onChange={(e) => handleChange('dean_email', e.target.value)}
                    placeholder="dean@institution.edu"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="college@institution.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Phone
                  </label>
                  <Input
                    value={formData.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+234 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  placeholder="https://college.institution.edu"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Location Within Campus
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Building Block
                  </label>
                  <Input
                    value={formData.building_block || ''}
                    onChange={(e) => handleChange('building_block', e.target.value)}
                    placeholder="e.g., Block A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Office Location
                  </label>
                  <Input
                    value={formData.office_location || ''}
                    onChange={(e) => handleChange('office_location', e.target.value)}
                    placeholder="e.g., 2nd Floor, Room 201"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700"
              />
              <label className="text-sm font-medium text-zinc-300">
                Active College
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : (college ? 'Update College' : 'Create College')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollegeModal;
