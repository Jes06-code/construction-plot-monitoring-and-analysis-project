import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivwsqwyseglqqtoekbum.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_j89Z7ZuM_4n5LEZ2l4IsTw_zNWxsOOo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STORAGE_BUCKETS = {
  DOCUMENTS: 'project-documents',
  PROGRESS_IMAGES: 'progress-images',
  AVATARS: 'avatars',
}

// Fetch all required documents (ownership + approval) for a project
export async function fetchProjectDocuments(projectId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .in('doc_type', ['ownership', 'approval']);
  if (error) throw error;
  return data;
}

// Check if both required docs exist
export async function hasRequiredDocuments(projectId) {
  const docs = await fetchProjectDocuments(projectId);
  const types = docs.map(d => d.doc_type);
  return types.includes('ownership') && types.includes('approval');
}

// Update project approval status and related fields
export async function updateProjectApproval(projectId, status, approverId, reason = null) {
  const update = {
    approval_status: status,
    approved_by: approverId,
    approved_at: new Date().toISOString(),
  };
  if (status === 'rejected' && reason) update.rejection_reason = reason;
  const { data, error } = await supabase
    .from('projects')
    .update(update)
    .eq('id', projectId);
  if (error) throw error;
  return data;
}

// Record an approval/rejection audit entry
export async function recordProjectApproval(projectId, approverId, decision, comment = null) {
  const insert = {
    project_id: projectId,
    approver_id: approverId,
    decision,
  };
  if (comment) insert.comment = comment;
  const { data, error } = await supabase
    .from('project_approvals')
    .insert([insert]);
  if (error) throw error;
  return data;
}
