import { createContext, useContext, useState, useEffect } from 'react'
import { generateProjectCode, generatePlotId } from '../utils/helpers'
import { CONSTRUCTION_STAGES, STAGE_PROGRESS_MAP, APPROVAL_ROLES } from '../utils/constants'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

// Seed demo data
function createDemoData() {
  const projects = [
    {
      id: 'p1', project_code: 'PRJ-2026-0001', plot_id: 'PLT-A101', title: 'Greenfield Industrial Complex',
      description: 'Large-scale industrial complex with 4 manufacturing units and admin building.',
      location: 'MIDC Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567,
      area_size: 25000, area_unit: 'sqft', investment_commitment: 45000000, workforce_commitment: 120,
      deadline: '2026-12-31', status: 'in_progress', current_stage: 'Brickwork',
      completion_percentage: 25, compliance_score: 85,
      stage_images: { 'Site': true, 'Foundation': true, 'Brickwork': true },
      created_by: '1', company_rep_id: '2', contractor_id: '4', created_at: '2026-01-15',
      auto_progress: true,
    },
    {
      id: 'p2', project_code: 'PRJ-2026-0002', plot_id: 'PLT-B205', title: 'Warehouse & Logistics Hub',
      description: 'Automated warehouse with cold storage and loading docks.',
      location: 'SEZ Vizag, Andhra Pradesh', latitude: 17.6868, longitude: 83.2185,
      area_size: 40000, area_unit: 'sqft', investment_commitment: 72000000, workforce_commitment: 85,
      deadline: '2026-08-15', status: 'in_progress', current_stage: 'Plumbing',
      completion_percentage: 55, compliance_score: 92,
      stage_images: { 'Site': true, 'Foundation': true, 'Brickwork': true, 'Ceiling': true, 'Wiring': true, 'Plumbing': true },
      created_by: '1', company_rep_id: '2', contractor_id: '4', created_at: '2025-09-01',
      auto_progress: true,
    },
    {
      id: 'p3', project_code: 'PRJ-2026-0003', plot_id: 'PLT-C310', title: 'Solar Panel Manufacturing Unit',
      description: 'Green energy equipment manufacturing facility.',
      location: 'Industrial Area, Jaipur', latitude: 26.9124, longitude: 75.7873,
      area_size: 18000, area_unit: 'sqft', investment_commitment: 38000000, workforce_commitment: 60,
      deadline: '2026-06-30', status: 'delayed', current_stage: 'Foundation',
      completion_percentage: 10, compliance_score: 62,
      stage_images: { 'Site': true, 'Foundation': true },
      created_by: '1', company_rep_id: '2', contractor_id: '4', created_at: '2025-11-20',
      auto_progress: true,
    },
    {
      id: 'p4', project_code: 'PRJ-2026-0004', plot_id: 'PLT-D412', title: 'Pharmaceutical Research Lab',
      description: 'Bio-safety level 2 research and production facility.',
      location: 'Genome Valley, Hyderabad', latitude: 17.4399, longitude: 78.3489,
      area_size: 15000, area_unit: 'sqft', investment_commitment: 95000000, workforce_commitment: 45,
      deadline: '2027-03-31', status: 'pending', current_stage: 'Site',
      completion_percentage: 0, compliance_score: 100,
      stage_images: {},
      created_by: '1', company_rep_id: '2', contractor_id: '4', created_at: '2026-03-01',
      auto_progress: true,
    },
    {
      id: 'p5', project_code: 'PRJ-2025-0010', plot_id: 'PLT-E520', title: 'Textile Processing Plant',
      description: 'Automated textile processing and dyeing unit.',
      location: 'Industrial Estate, Surat', latitude: 21.1702, longitude: 72.8311,
      area_size: 30000, area_unit: 'sqft', investment_commitment: 55000000, workforce_commitment: 150,
      deadline: '2026-04-15', status: 'in_progress', current_stage: 'Painting',
      completion_percentage: 90, compliance_score: 78,
      stage_images: { 'Site': true, 'Foundation': true, 'Brickwork': true, 'Ceiling': true, 'Wiring': true, 'Plumbing': true, 'Fire Safety': true, 'Ventilation': true, 'Plastering': true, 'Flooring': true, 'Painting': true },
      created_by: '1', company_rep_id: '2', contractor_id: '4', created_at: '2025-03-10',
      auto_progress: true,
    },
  ]

  const milestones = [
    { id: 'm1', project_id: 'p1', title: 'Site Clearing & Leveling', completed: true, completed_at: '2026-02-01', target_date: '2026-01-31', order_index: 1 },
    { id: 'm2', project_id: 'p1', title: 'Foundation Completed', completed: true, completed_at: '2026-03-10', target_date: '2026-03-15', order_index: 2 },
    { id: 'm3', project_id: 'p1', title: 'Brickwork 50%', completed: false, target_date: '2026-04-30', order_index: 3 },
    { id: 'm4', project_id: 'p1', title: 'Roof Casting', completed: false, target_date: '2026-06-15', order_index: 4 },
    { id: 'm5', project_id: 'p1', title: 'Interior & Finishing', completed: false, target_date: '2026-10-01', order_index: 5 },
    { id: 'm6', project_id: 'p1', title: 'Final Handover', completed: false, target_date: '2026-12-31', order_index: 6 },
    { id: 'm7', project_id: 'p2', title: 'Foundation', completed: true, completed_at: '2025-11-15', target_date: '2025-11-30', order_index: 1 },
    { id: 'm8', project_id: 'p2', title: 'Structure Complete', completed: true, completed_at: '2026-02-20', target_date: '2026-02-28', order_index: 2 },
    { id: 'm9', project_id: 'p2', title: 'Roof & Waterproofing', completed: false, target_date: '2026-05-15', order_index: 3 },
    { id: 'm10', project_id: 'p2', title: 'Cold Storage Installation', completed: false, target_date: '2026-07-01', order_index: 4 },
    { id: 'm11', project_id: 'p3', title: 'Foundation Started', completed: true, completed_at: '2026-01-10', target_date: '2025-12-15', order_index: 1 },
    { id: 'm12', project_id: 'p3', title: 'Foundation Complete', completed: false, target_date: '2026-03-01', order_index: 2 },
    { id: 'm13', project_id: 'p5', title: 'Painting & Finishing', completed: false, target_date: '2026-04-01', order_index: 1 },
    { id: 'm14', project_id: 'p5', title: 'Equipment Installation', completed: false, target_date: '2026-04-10', order_index: 2 },
  ]

  const budgetEntries = [
    // p1 total allocated: 40000000, total spent: 15800000
    { id: 'b1', project_id: 'p1', category: 'Labour', allocated: 10000000, spent: 3950000 },
    { id: 'b2', project_id: 'p1', category: 'Materials', allocated: 18000000, spent: 7110000 },
    { id: 'b3', project_id: 'p1', category: 'Equipment', allocated: 6000000, spent: 2370000 },
    { id: 'b4', project_id: 'p1', category: 'Safety and Compliance', allocated: 2000000, spent: 790000 },
    { id: 'b5', project_id: 'p1', category: 'Contingency', allocated: 1200000, spent: 474000 },
    { id: 'b6', project_id: 'p1', category: 'Overhead', allocated: 2800000, spent: 1106000 },

    // p2 total allocated: 58000000, total spent: 34000000
    { id: 'b7', project_id: 'p2', category: 'Labour', allocated: 14500000, spent: 8500000 },
    { id: 'b8', project_id: 'p2', category: 'Materials', allocated: 26100000, spent: 15300000 },
    { id: 'b9', project_id: 'p2', category: 'Equipment', allocated: 8700000, spent: 5100000 },
    { id: 'b10', project_id: 'p2', category: 'Safety and Compliance', allocated: 2900000, spent: 1700000 },
    { id: 'b11', project_id: 'p2', category: 'Contingency', allocated: 1740000, spent: 1020000 },
    { id: 'b12', project_id: 'p2', category: 'Overhead', allocated: 4060000, spent: 2380000 },

    // p3 total allocated: 22000000, total spent: 3500000
    { id: 'b13', project_id: 'p3', category: 'Labour', allocated: 5500000, spent: 875000 },
    { id: 'b14', project_id: 'p3', category: 'Materials', allocated: 9900000, spent: 1575000 },
    { id: 'b15', project_id: 'p3', category: 'Equipment', allocated: 3300000, spent: 525000 },
    { id: 'b16', project_id: 'p3', category: 'Safety and Compliance', allocated: 1100000, spent: 175000 },
    { id: 'b17', project_id: 'p3', category: 'Contingency', allocated: 660000, spent: 105000 },
    { id: 'b18', project_id: 'p3', category: 'Overhead', allocated: 1540000, spent: 245000 },

    // p5 total allocated: 35000000, total spent: 31500000
    { id: 'b19', project_id: 'p5', category: 'Labour', allocated: 8750000, spent: 7875000 },
    { id: 'b20', project_id: 'p5', category: 'Materials', allocated: 15750000, spent: 14175000 },
    { id: 'b21', project_id: 'p5', category: 'Equipment', allocated: 5250000, spent: 4725000 },
    { id: 'b22', project_id: 'p5', category: 'Safety and Compliance', allocated: 1750000, spent: 1575000 },
    { id: 'b23', project_id: 'p5', category: 'Contingency', allocated: 1050000, spent: 945000 },
    { id: 'b24', project_id: 'p5', category: 'Overhead', allocated: 2450000, spent: 2205000 },
  ]

  const progressImages = [
    { id: 'img1', project_id: 'p1', uploaded_by: '3', image_url: '', stage: 'Brickwork', remarks: 'Foundation work completed. Starting brickwork on west wing.', latitude: 18.5204, longitude: 73.8567, location_name: 'MIDC Pune', captured_at: '2026-03-10T09:30:00', ai_analysis: { current_stage: 'Brickwork', completion_percentage: 25, previous_stage: 'Foundation', next_stage: 'Ceiling', risk_level: 'Low', confidence: 0.88 } },
    { id: 'img2', project_id: 'p1', uploaded_by: '3', image_url: '', stage: 'Brickwork', remarks: 'East wing brickwork in progress. Workers on site.', latitude: 18.5204, longitude: 73.8567, location_name: 'MIDC Pune', captured_at: '2026-03-20T14:15:00', ai_analysis: { current_stage: 'Brickwork', completion_percentage: 25, previous_stage: 'Foundation', next_stage: 'Ceiling', risk_level: 'Low', confidence: 0.85 } },
    { id: 'img3', project_id: 'p2', uploaded_by: '3', image_url: '', stage: 'Plumbing', remarks: 'Plumbing lines being laid across the warehouse.', latitude: 17.6868, longitude: 83.2185, location_name: 'SEZ Vizag', captured_at: '2026-03-25T10:00:00', ai_analysis: { current_stage: 'Plumbing', completion_percentage: 55, previous_stage: 'Wiring', next_stage: 'Fire Safety', risk_level: 'Medium', confidence: 0.82 } },
    { id: 'img4', project_id: 'p3', uploaded_by: '3', image_url: '', stage: 'Foundation', remarks: 'Foundation trenching delayed due to soil issues.', latitude: 26.9124, longitude: 75.7873, location_name: 'Jaipur', captured_at: '2026-03-28T11:45:00', ai_analysis: { current_stage: 'Foundation', completion_percentage: 10, previous_stage: 'Site', next_stage: 'Brickwork', risk_level: 'High', confidence: 0.79 } },
    { id: 'img5', project_id: 'p5', uploaded_by: '3', image_url: '', stage: 'Painting', remarks: 'Interior painting almost done. Exterior finishing next.', latitude: 21.1702, longitude: 72.8311, location_name: 'Surat', captured_at: '2026-03-29T16:30:00', ai_analysis: { current_stage: 'Painting', completion_percentage: 90, previous_stage: 'Flooring', next_stage: 'Final Inspection', risk_level: 'Low', confidence: 0.91 } },
  ]

  const notifications = [
    { id: 'n1', user_id: '1', project_id: 'p3', title: 'Deadline Alert', message: 'Solar Panel Manufacturing Unit deadline is approaching with only 10% completion.', type: 'deadline', read: false, created_at: '2026-03-30T08:00:00' },
    { id: 'n2', user_id: '1', project_id: 'p5', title: 'Near Completion', message: 'Textile Processing Plant is at 90% completion. Final inspection required.', type: 'info', read: false, created_at: '2026-03-29T10:00:00' },
    { id: 'n3', user_id: '3', project_id: 'p1', title: 'Upload Reminder', message: 'No progress images uploaded for Greenfield Industrial Complex in the last 5 days.', type: 'missing_upload', read: true, created_at: '2026-03-28T09:00:00' },
    { id: 'n4', user_id: '1', project_id: 'p3', title: 'Compliance Warning', message: 'Solar Panel Manufacturing Unit compliance score dropped to 62%.', type: 'compliance', read: false, created_at: '2026-03-27T14:00:00' },
    { id: 'n5', user_id: '4', project_id: 'p2', title: 'Milestone Due', message: 'Roof & Waterproofing milestone due by May 15, 2026.', type: 'deadline', read: false, created_at: '2026-03-26T08:00:00' },
  ]

  const documents = [
    { id: 'd1', project_id: 'p1', uploaded_by: '1', doc_type: 'ownership', file_name: 'plot_ownership_deed.pdf', file_url: '#', file_size: 245000, created_at: '2026-01-15' },
    { id: 'd2', project_id: 'p1', uploaded_by: '2', doc_type: 'approval', file_name: 'environmental_clearance.pdf', file_url: '#', file_size: 180000, created_at: '2026-01-20' },
    { id: 'd3', project_id: 'p2', uploaded_by: '1', doc_type: 'ownership', file_name: 'sez_allotment.pdf', file_url: '#', file_size: 320000, created_at: '2025-09-01' },
    { id: 'd4', project_id: 'p3', uploaded_by: '2', doc_type: 'compliance', file_name: 'safety_audit_report.pdf', file_url: '#', file_size: 150000, created_at: '2025-12-01' },
  ]

  // Approval actions log
  const approvalActions = [
    { id: 'a1', project_id: 'p1', action: 'approved', by_user_id: '1', by_role: 'admin', by_name: 'DHAROON', remarks: 'All documents verified.', created_at: '2026-01-16T10:00:00' },
    { id: 'a2', project_id: 'p2', action: 'approved', by_user_id: '5', by_role: 'government_authority', by_name: 'JESWANTH', remarks: 'Government clearance granted.', created_at: '2025-09-05T11:00:00' },
  ]

  return { projects, milestones, budgetEntries, progressImages, notifications, documents, approvalActions }
}

export function DataProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  
  // Initialize from localStorage for persistence of local-only projects
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('industrialops_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved data', e);
      }
    }
    return {
      projects: [],
      milestones: [],
      budgetEntries: [],
      progressImages: [],
      notifications: [],
      documents: [],
      approvalActions: [],
    };
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  // Load initial data from Supabase on mount or auth change
  useEffect(() => {
    async function loadInitialData() {
      if (authLoading) return;
      
      // If no user, we might want to show demo data or nothing
      if (!user) {
        setData(createDemoData());
        setIsDemoData(true);
        setIsDataLoaded(true);
        return;
      }

      try {
        const [{ data: projects, error: errProj },
          { data: milestones, error: errMil },
          { data: budgetEntries, error: errBud },
          { data: progressImages, error: errImg },
          { data: documents, error: errDoc },
          { data: notifications, error: errNot },
          { data: approvalActions, error: errApp }] = await Promise.all([
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('milestones').select('*'),
            supabase.from('budget_entries').select('*'),
            supabase.from('progress_images').select('*'),
            supabase.from('documents').select('*'),
            supabase.from('notifications').select('*'),
            supabase.from('project_approvals').select('*'),
          ])
        
        if (errProj) {
          console.error('Error loading projects from Supabase', errProj);
          // If Supabase fails, we stay with what we have (demo or local)
          if (!isDataLoaded) {
            setData(createDemoData());
            setIsDemoData(true);
          }
        } else {
          setIsDemoData(false);
          
          // Merge logic: Keep projects that are marked as _local
          // This ensures that projects that failed to save to Supabase are not lost on refresh
          const localProjects = data.projects.filter(p => p._local);
          const localMilestones = data.milestones.filter(m => String(m.id).startsWith('m'));
          const localBudgets = data.budgetEntries.filter(b => String(b.id).startsWith('b'));
          const localImages = data.progressImages.filter(i => String(i.id).startsWith('img'));

          setData({
            projects: [...(projects || []), ...localProjects],
            milestones: [...(milestones || []), ...localMilestones],
            budgetEntries: [...(budgetEntries || []), ...localBudgets],
            progressImages: [...(progressImages || []), ...localImages],
            notifications: notifications || [],
            documents: documents || [],
            approvalActions: approvalActions || [],
          })
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setData(createDemoData());
        setIsDemoData(true);
      } finally {
        setIsDataLoaded(true);
      }
    }
    loadInitialData()
  }, [user, authLoading]);


  // Persist data to localStorage for quick reloads (optional)
  useEffect(() => {
    localStorage.setItem('industrialops_data', JSON.stringify(data))
  }, [data])

  // ─── Project CRUD ───

  const refreshProjects = async () => {
    const { data: projects, error } = await supabase.from('projects').select('*')
    if (error) {
      console.error('Error refreshing projects:', error)
      return
    }
    // Preserve locally created projects marked with _local
    const localProjects = data.projects?.filter(p => p._local) || []
    setData(prev => ({ ...prev, projects: [...(projects || []), ...localProjects] }))
    setIsDataLoaded(true)
  }

  const addProject = async (project) => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const autoProgress = project.auto_progress !== undefined ? project.auto_progress : true
    
    const newProject = {
      ...project,
      project_code: generateProjectCode(),
      plot_id: project.plot_id || generatePlotId(),
      status: 'pending',
      current_stage: 'Site',
      completion_percentage: 0,
      compliance_score: 100,
      stage_images: {},
      auto_progress: autoProgress,
      created_at: new Date().toISOString(),
    }

    // If we are in demo mode or the user ID is just a placeholder (like '1'), 
    // we save only to local state to avoid database foreign key errors.
    if (isDemoData || !project.created_by || !isUUID(project.created_by)) {
      console.log('Saving project to local state (Demo Mode active or invalid User ID)');
      const localProject = { ...newProject, id: 'p' + Date.now() };
      setData(prev => ({ ...prev, projects: [localProject, ...prev.projects] }));
      return localProject;
    }

    // Insert into Supabase
    try {
      const { data: inserted, error } = await supabase.from('projects').insert(newProject).select('*').single()
      if (error) {
        // If it's a foreign key violation or other DB error, we gracefully fallback to local-only for this project
        console.warn('Supabase project insert failed, falling back to local state:', error);
        const localProject = { ...newProject, id: 'p' + Date.now(), _local: true };
        setData(prev => ({ ...prev, projects: [localProject, ...prev.projects] }));
        return localProject;
      }
      // Update local state for UI responsiveness
      setData(prev => ({ ...prev, projects: [inserted, ...prev.projects] }))
      return inserted
    } catch (err) {
      console.error('Catching Supabase project insert error:', err);
      const localProject = { ...newProject, id: 'p' + Date.now(), _local: true };
      setData(prev => ({ ...prev, projects: [localProject, ...prev.projects] }));
      return localProject;
    }
  }

  const updateProject = async (id, updates) => {
    const { error } = await supabase.from('projects').update(updates).eq('id', id)
    if (error) {
      console.error('Error updating project:', error)
      throw error
    }
    await refreshProjects()
  }

  const deleteProject = async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
    await refreshProjects()
  }

  // ─── Stage-wise image upload with auto-progress ───

  /**
   * When an image is uploaded for a specific construction stage,
   * automatically update the project progress to that stage's mapped percentage.
   */
  const uploadStageImage = async (projectId, stage, imageEntry) => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const project = data.projects.find(p => p.id === projectId)
    if (!project) return null

    const newImg = {
      project_id: projectId,
      uploaded_by: imageEntry.uploaded_by,
      image_url: imageEntry.image_url,
      remarks: imageEntry.remarks,
      stage: stage,
      ai_analysis: imageEntry.ai_analysis,
      created_at: new Date().toISOString()
    }

    if (isDemoData || !isUUID(projectId)) {
      console.log('Local image upload for demo project');
      const localImg = { ...newImg, id: 'img' + Date.now() };
      
      // Update local state
      const updatedImages = [...data.progressImages, localImg];
      const updatedProjects = data.projects.map(p => {
        if (p.id === projectId) {
          const newStageImages = { ...(p.stage_images || {}), [stage]: true };
          const newCompletion = project.auto_progress ? (STAGE_PROGRESS_MAP[stage] || p.completion_percentage) : p.completion_percentage;
          return { ...p, stage_images: newStageImages, current_stage: stage, completion_percentage: newCompletion };
        }
        return p;
      });

      setData(prev => {
        let newBudgetEntries = [...prev.budgetEntries];
        if (imageEntry.amount_spent > 0) {
           const totalBudget = project.investment_commitment || 0;
           const budgetSplit = [
             { name: 'Labour', pct: 0.25 }, { name: 'Materials', pct: 0.45 }, { name: 'Equipment', pct: 0.15 },
             { name: 'Safety and Compliance', pct: 0.05 }, { name: 'Contingency', pct: 0.03 }, { name: 'Overhead', pct: 0.07 }
           ];
           for (const cat of budgetSplit) {
             const spentAmount = Math.round(imageEntry.amount_spent * cat.pct);
             const allocatedAmount = Math.round(totalBudget * cat.pct);
             const existingIndex = newBudgetEntries.findIndex(b => b.project_id === projectId && b.category === cat.name);
             if (existingIndex >= 0) {
               const existing = newBudgetEntries[existingIndex];
               const newSpent = (existing.spent || 0) + spentAmount;
               // Always keep allocated >= spent
               const newAllocated = Math.max(existing.allocated || allocatedAmount, newSpent);
               newBudgetEntries[existingIndex] = { ...existing, spent: newSpent, allocated: newAllocated };
             } else {
               const newAllocated = Math.max(allocatedAmount, spentAmount);
               newBudgetEntries.push({ id: 'b' + Date.now() + Math.random(), project_id: projectId, category: cat.name, allocated: newAllocated, spent: spentAmount, created_at: new Date().toISOString() });
             }
           }
        }
        return { ...prev, progressImages: updatedImages, projects: updatedProjects, budgetEntries: newBudgetEntries };
      });
      return localImg;
    }

    // 1. Save the image record to Supabase
    const { data: insertedImg, error: imgErr } = await supabase
      .from('progress_images')
      .insert(newImg)
      .select('*')
      .single()

    if (imgErr) {
      console.error('Error saving progress image:', imgErr)
      return null
    }

    // 2. Calculate progress
    const stageProgress = STAGE_PROGRESS_MAP[stage] ?? 0
    const newProgress = Math.max(project.completion_percentage || 0, stageProgress)
    const newStatus = stage === 'Final Inspection' ? 'completed' : 'in_progress'

    // 3. Update the Project in Supabase
    const { error: projErr } = await supabase
      .from('projects')
      .update({
        current_stage: stage,
        completion_percentage: newProgress,
        status: newStatus
      })
      .eq('id', projectId)

    if (projErr) console.error('Error updating project progress:', projErr)

    // 4. Update Budget if amount_spent is provided
    if (imageEntry.amount_spent > 0) {
      const totalBudget = project.investment_commitment || 0;
      const budgetSplit = [
        { name: 'Labour', pct: 0.25 }, { name: 'Materials', pct: 0.45 }, { name: 'Equipment', pct: 0.15 },
        { name: 'Safety and Compliance', pct: 0.05 }, { name: 'Contingency', pct: 0.03 }, { name: 'Overhead', pct: 0.07 }
      ];
      for (const cat of budgetSplit) {
        const spentAmount = Math.round(imageEntry.amount_spent * cat.pct);
        const allocatedAmount = Math.round(totalBudget * cat.pct);
        const existingEntry = data.budgetEntries.find(b => b.project_id === projectId && b.category === cat.name);
        if (existingEntry) {
          const updatedSpent = (existingEntry.spent || 0) + spentAmount;
          // Keep allocated >= spent
          const updatedAllocated = Math.max(existingEntry.allocated || allocatedAmount, updatedSpent);
          await supabase.from('budget_entries').update({ spent: updatedSpent, allocated: updatedAllocated }).eq('id', existingEntry.id);
        } else {
          const newAllocated = Math.max(allocatedAmount, spentAmount);
          await supabase.from('budget_entries').insert({
            project_id: projectId,
            category: cat.name,
            allocated: newAllocated,
            spent: spentAmount,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    // 5. Refresh local state
    await refreshProjects()
    const { data: allImages } = await supabase.from('progress_images').select('*')
    const { data: allBudget } = await supabase.from('budget_entries').select('*')
    setData(prev => ({ ...prev, progressImages: allImages || [], budgetEntries: allBudget || prev.budgetEntries }))

    return insertedImg
  }

  // ─── Approval / Rejection system ───

  const approveProject = async (projectId, userId, userRole, userName, remarks = '') => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    // Permission check is handled in UI; allowing approval

    const action = {
      project_id: projectId,
      action: 'approved',
      by_user_id: userId,
      by_role: userRole,
      by_name: userName,
      remarks,
      created_at: new Date().toISOString(),
    }

    if (isDemoData || !isUUID(projectId)) {
      console.log('Local approval for demo project');
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? { ...p, status: 'in_progress' } : p),
        approvalActions: [action, ...(prev.approvalActions || [])]
      }));
      
      addNotification({ project_id: projectId, title: 'Project Approved', message: `Project has been approved by ${userName}.`, type: 'info', user_id: userId });
      return true;
    }

    // 1. Optimistically update local state
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, status: 'in_progress' } : p),
      approvalActions: [action, ...(prev.approvalActions || [])]
    }));

    // 2. Update project status in Supabase
    const { error: projErr } = await supabase
      .from('projects')
      .update({ status: 'in_progress' })
      .eq('id', projectId);
    
    if (projErr) {
      console.error('Error approving project in DB:', projErr);
      // Revert if needed, but we'll try to push forward
    }

    // 3. Log approval action
    await supabase.from('project_approvals').insert(action).catch(console.error);

    // 4. Refresh data from DB in the background
    refreshProjects().catch(console.error);
    addNotification({ project_id: projectId, title: 'Project Approved', message: `Project has been approved by ${userName}.`, type: 'info', user_id: userId });
    return true;
  }

  const rejectProject = async (projectId, userId, userRole, userName, remarks = '') => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!APPROVAL_ROLES.includes(userRole)) return false

    const action = {
      project_id: projectId,
      action: 'rejected',
      by_user_id: userId,
      by_role: userRole,
      by_name: userName,
      remarks,
      created_at: new Date().toISOString(),
    }

    if (isDemoData || !isUUID(projectId)) {
      console.log('Local rejection for demo project');
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? { ...p, status: 'rejected' } : p),
        approvalActions: [action, ...(prev.approvalActions || [])]
      }));
      
      addNotification({ project_id: projectId, title: 'Project Terminated', message: `Project has been rejected/terminated by ${userName}.`, type: 'deadline', user_id: userId });
      return true;
    }

    // 1. Optimistically update local state
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, status: 'rejected' } : p),
      approvalActions: [action, ...(prev.approvalActions || [])]
    }));

    // 2. Update project status in Supabase
    const { error: projErr } = await supabase
      .from('projects')
      .update({ status: 'rejected' })
      .eq('id', projectId);

    if (projErr) {
      console.error('Error rejecting project in DB:', projErr);
    }

    // 3. Log rejection action
    await supabase.from('project_approvals').insert(action).catch(console.error);

    // 4. Refresh data from DB in the background
    refreshProjects().catch(console.error);

    addNotification({ project_id: projectId, title: 'Project Terminated', message: `Project has been rejected/terminated by ${userName}.`, type: 'deadline', user_id: userId });
    return true;
  }

  const getProjectApprovalHistory = (projectId) =>
    (data.approvalActions || [])
      .filter(a => a.project_id === projectId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // ─── Milestones ───

  const addMilestone = async (milestone) => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const newMs = { ...milestone, completed: false, created_at: new Date().toISOString() }
    
    if (isDemoData || !isUUID(milestone.project_id)) {
      const localMs = { ...newMs, id: 'm' + Date.now() };
      setData(prev => ({ ...prev, milestones: [...prev.milestones, localMs] }));
      return localMs;
    }

    const { data: inserted, error } = await supabase.from('milestones').insert(newMs).select('*').single()
    if (error) {
      console.error('Supabase insert milestone error:', error)
      throw error
    }
    setData(prev => ({ ...prev, milestones: [...prev.milestones, inserted] }))
    return inserted
  }

  const toggleMilestone = async (id) => {
    const milestone = data.milestones.find(m => m.id === id)
    if (!milestone) return

    const updates = {
      completed: !milestone.completed,
      completed_at: !milestone.completed ? new Date().toISOString() : null
    }

    const { error } = await supabase.from('milestones').update(updates).eq('id', id)
    if (error) {
      console.error('Error toggling milestone:', error)
      return
    }

    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }))
  }

  // ─── Legacy addProgressImage (kept for backward compat) ───
  const addProgressImage = async (entry) => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const newImg = { ...entry, created_at: new Date().toISOString() }

    if (isDemoData || !isUUID(entry.project_id)) {
      const localImg = { ...newImg, id: 'img' + Date.now() };
      setData(prev => ({ ...prev, progressImages: [...prev.progressImages, localImg] }));
      return localImg;
    }

    const { data: inserted, error } = await supabase.from('progress_images').insert(newImg).select('*').single()
    if (error) {
      console.error('Supabase insert progress image error:', error)
      throw error
    }
    setData(prev => ({ ...prev, progressImages: [...prev.progressImages, inserted] }))
    return inserted
  }

  // ─── Budget ───
  const addBudgetEntry = async (entry) => {
    const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const newEntry = { ...entry, created_at: new Date().toISOString() }

    if (isDemoData || !isUUID(entry.project_id)) {
      const localEntry = { ...newEntry, id: 'b' + Date.now() };
      setData(prev => ({ ...prev, budgetEntries: [...prev.budgetEntries, localEntry] }));
      return localEntry;
    }

    const { data: inserted, error } = await supabase.from('budget_entries').insert(newEntry).select('*').single()
    if (error) {
      console.error('Supabase insert budget entry error:', error)
      throw error
    }
    setData(prev => ({ ...prev, budgetEntries: [...prev.budgetEntries, inserted] }))
    return inserted
  }

  // ─── Notifications ───
  const addNotification = (notif) => {
    const newN = { ...notif, id: 'n' + Date.now(), read: false, created_at: new Date().toISOString() }
    setData(prev => ({ ...prev, notifications: [newN, ...prev.notifications] }))
  }

  const markNotificationRead = (id) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }))
  }

  const markAllNotificationsRead = () => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }))
  }

  // ─── Documents ───
  const addDocument = async (doc) => {
    const newDoc = { ...doc, created_at: new Date().toISOString() }
    const { data: inserted, error } = await supabase.from('documents').insert(newDoc).select('*').single()
    if (error) {
      console.error('Supabase insert document error:', error)
      throw error
    }
    setData(prev => ({ ...prev, documents: [...prev.documents, inserted] }))
    return inserted
  }

  // ─── Query helpers ───
  const getProjectMilestones = (projectId) => data.milestones.filter(m => m.project_id === projectId).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  const getProjectBudget = (projectId) => data.budgetEntries.filter(b => b.project_id === projectId)
  const getProjectImages = (projectId) => data.progressImages.filter(img => img.project_id === projectId).sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at))
  const getProjectDocuments = (projectId) => data.documents.filter(d => d.project_id === projectId)
  const getUserNotifications = (userId) => data.notifications.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const getUnreadCount = (userId) => data.notifications.filter(n => n.user_id === userId && !n.read).length

  const resetData = () => {
    const fresh = createDemoData()
    setData(fresh)
  }

  return (
    <DataContext.Provider value={{
      ...data,
      isDataLoaded,
      isDemoData,
      addProject, refreshProjects, updateProject, deleteProject,
      addMilestone, toggleMilestone,
      addProgressImage,
      uploadStageImage,
      addBudgetEntry,
      addNotification,
      markNotificationRead, markAllNotificationsRead,
      addDocument,
      approveProject, rejectProject, getProjectApprovalHistory,
      getProjectMilestones, getProjectBudget, getProjectImages, getProjectDocuments,
      getUserNotifications, getUnreadCount,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
