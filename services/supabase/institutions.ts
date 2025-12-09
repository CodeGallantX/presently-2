import { supabase, isSupabaseConfigured } from './client';
import { Institution, College, InstitutionStatus } from '../../types';

/**
 * Institution Service
 * Functions for managing institutions
 */

// Get all active institutions
export async function getAllInstitutions(): Promise<Institution[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.error('Supabase is not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching institutions:', error);
    return [];
  }
}

// Get institution by ID
export async function getInstitutionById(id: string | number): Promise<Institution | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching institution:', error);
    return null;
  }
}

// Get institution by short name
export async function getInstitutionByShortName(shortName: string): Promise<Institution | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('short_name', shortName)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching institution by short name:', error);
    return null;
  }
}

// Create institution (Admin only)
export async function createInstitution(
  institutionData: Omit<Institution, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
): Promise<{ success: boolean; data?: Institution; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('institutions')
      .insert({
        ...institutionData,
        created_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating institution:', error);
    return { success: false, error: error.message };
  }
}

// Update institution (Admin only)
export async function updateInstitution(
  id: string | number,
  institutionData: Partial<Omit<Institution, 'id' | 'created_at' | 'created_by'>>
): Promise<{ success: boolean; data?: Institution; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('institutions')
      .update({
        ...institutionData,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating institution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * College Service
 * Functions for managing colleges
 */

// Get all colleges for an institution
export async function getCollegesByInstitution(institutionId: string | number): Promise<College[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('institution_id', institutionId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching colleges:', error);
    return [];
  }
}

// Get college by ID
export async function getCollegeById(id: string | number): Promise<College | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching college:', error);
    return null;
  }
}

// Get college by code within an institution
export async function getCollegeByCode(institutionId: string | number, code: string): Promise<College | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('institution_id', institutionId)
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching college by code:', error);
    return null;
  }
}

// Create college (Admin only)
export async function createCollege(
  collegeData: Omit<College, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
): Promise<{ success: boolean; data?: College; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('colleges')
      .insert({
        ...collegeData,
        created_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating college:', error);
    return { success: false, error: error.message };
  }
}

// Update college (Admin only)
export async function updateCollege(
  id: string | number,
  collegeData: Partial<Omit<College, 'id' | 'created_at' | 'created_by'>>
): Promise<{ success: boolean; data?: College; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('colleges')
      .update({
        ...collegeData,
        updated_by: userData?.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating college:', error);
    return { success: false, error: error.message };
  }
}

// Delete college (Admin only)
export async function deleteCollege(id: string | number): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { error } = await supabase
      .from('colleges')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting college:', error);
    return { success: false, error: error.message };
  }
}

// Get user's institution
export async function getUserInstitution(): Promise<Institution | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', userData.user.id)
      .single();

    if (!profileData?.institution_id) return null;

    return getInstitutionById(profileData.institution_id);
  } catch (error: any) {
    console.error('Error fetching user institution:', error);
    return null;
  }
}

// Get user's college
export async function getUserCollege(): Promise<College | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('college_id')
      .eq('id', userData.user.id)
      .single();

    if (!profileData?.college_id) return null;

    return getCollegeById(profileData.college_id);
  } catch (error: any) {
    console.error('Error fetching user college:', error);
    return null;
  }
}
