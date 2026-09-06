export const ROLES = {
  ADMIN: 'admin',
  COMPANY_REP: 'company_rep',
  FIELD_OFFICER: 'field_officer',
  CONTRACTOR: 'contractor',
  GOVERNMENT_AUTHORITY: 'government_authority',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Industrial Authority (Admin)',
  [ROLES.COMPANY_REP]: 'Company Representative',
  [ROLES.FIELD_OFFICER]: 'Field Officer',
  [ROLES.CONTRACTOR]: 'Contractor',
  [ROLES.GOVERNMENT_AUTHORITY]: 'Government Authority',
}

export const ROLE_COLORS = {
  [ROLES.ADMIN]: '#2563eb',
  [ROLES.COMPANY_REP]: '#7c3aed',
  [ROLES.FIELD_OFFICER]: '#059669',
  [ROLES.CONTRACTOR]: '#d97706',
  [ROLES.GOVERNMENT_AUTHORITY]: '#ec4899',
}

export const PROJECT_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  DELAYED: 'delayed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  in_progress: 'In Progress',
  delayed: 'Delayed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Terminated',
}

export const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  in_progress: '#10b981',
  delayed: '#ef4444',
  completed: '#059669',
  cancelled: '#6b7280',
  rejected: '#dc2626',
}

// Stage-wise progress mapping — each stage maps to a cumulative %
export const STAGE_PROGRESS_MAP = {
  'Site':             0,
  'Foundation':       10,
  'Brickwork':        25,
  'Ceiling':          35,
  'Wiring':           40,
  'Plumbing':         55,
  'Fire Safety':      60,
  'Ventilation':      65,
  'Plastering':       75,
  'Flooring':         85,
  'Painting':         90,
  'Final Inspection': 100,
}

// Ordered list of construction stages (derived from the map)
export const CONSTRUCTION_STAGES = Object.keys(STAGE_PROGRESS_MAP)

// Roles allowed to approve / reject projects
export const APPROVAL_ROLES = [ROLES.GOVERNMENT_AUTHORITY]

export const APPROVAL_ROLE_LABELS = {
  [ROLES.ADMIN]: 'Industrial Ops',
  [ROLES.COMPANY_REP]: 'Company',
  [ROLES.GOVERNMENT_AUTHORITY]: 'Government Authority',
}

export const RISK_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
}
