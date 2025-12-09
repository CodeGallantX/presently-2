import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Institution } from '../../types';

interface InstitutionModalProps {
  institution?: Institution;
  onSave: (data: Partial<Institution>) => Promise<void>;
  onClose: () => void;
}

export const InstitutionModal: React.FC<InstitutionModalProps> = ({
  institution,
  onSave,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Institution>>({
    full_name: institution?.full_name || '',
    short_name: institution?.short_name || '',
    abbreviation: institution?.abbreviation || '',
    country: institution?.country || '',
    state_province: institution?.state_province || '',
    city: institution?.city || '',
    address: institution?.address || '',
    postal_code: institution?.postal_code || '',
    institution_type: institution?.institution_type || 'UNIVERSITY',
    website_url: institution?.website_url || '',
    contact_email: institution?.contact_email || '',
    contact_phone: institution?.contact_phone || '',
    established_year: institution?.established_year || new Date().getFullYear(),
    accreditation_status: institution?.accreditation_status || 'ACCREDITED',
    is_active: institution?.is_active !== false,
  });

  const handleChange = (field: keyof Institution, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.full_name?.trim()) {
      setError('Institution name is required');
      return;
    }
    if (!formData.short_name?.trim()) {
      setError('Short name/abbreviation is required');
      return;
    }
    if (!formData.country?.trim()) {
      setError('Country is required');
      return;
    }
    if (!formData.city?.trim()) {
      setError('City is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save institution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-xl font-bold text-foreground">
            {institution ? 'Edit Institution' : 'Create Institution'}
          </h2>
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
                    Institution Name *
                  </label>
                  <Input
                    value={formData.full_name || ''}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="e.g., Obafemi Awolowo University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Short Name/Abbreviation *
                  </label>
                  <Input
                    value={formData.short_name || ''}
                    onChange={(e) => handleChange('short_name', e.target.value)}
                    placeholder="e.g., OAU"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Alternative Abbreviation
                </label>
                <Input
                  value={formData.abbreviation || ''}
                  onChange={(e) => handleChange('abbreviation', e.target.value)}
                  placeholder="Alternative abbreviation"
                  maxLength={10}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Institution Type *
                  </label>
                  <select
                    value={formData.institution_type || ''}
                    onChange={(e) => handleChange('institution_type', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="UNIVERSITY">University</option>
                    <option value="POLYTECHNIC">Polytechnic</option>
                    <option value="COLLEGE">College</option>
                    <option value="INSTITUTE">Institute</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Year Established
                  </label>
                  <Input
                    type="number"
                    value={formData.established_year || ''}
                    onChange={(e) => handleChange('established_year', parseInt(e.target.value))}
                    placeholder="e.g., 1961"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Location Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Country *
                  </label>
                  <Input
                    value={formData.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="e.g., Nigeria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    State/Province
                  </label>
                  <Input
                    value={formData.state_province || ''}
                    onChange={(e) => handleChange('state_province', e.target.value)}
                    placeholder="e.g., Osun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    City *
                  </label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g., Ile-Ife"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Postal Code
                  </label>
                  <Input
                    value={formData.postal_code || ''}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    placeholder="Postal/Zip code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full street address"
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground text-sm placeholder-zinc-500 focus:outline-none focus:border-primary"
                />
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
                    placeholder="contact@institution.edu"
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
                  placeholder="https://institution.edu"
                />
              </div>
            </div>
          </div>

          {/* Accreditation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Accreditation & Status
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Accreditation Status
                  </label>
                  <select
                    value={formData.accreditation_status || ''}
                    onChange={(e) => handleChange('accreditation_status', e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="ACCREDITED">Accredited</option>
                    <option value="PROVISIONAL">Provisional</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active !== false}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700"
                    />
                    <span className="text-sm font-medium text-zinc-300">Active Institution</span>
                  </label>
                </div>
              </div>
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
              {loading ? 'Saving...' : (institution ? 'Update Institution' : 'Create Institution')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionModal;
