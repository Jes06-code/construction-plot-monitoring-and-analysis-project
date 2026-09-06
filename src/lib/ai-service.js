import { STAGE_PROGRESS_MAP, CONSTRUCTION_STAGES } from '../utils/constants'

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

export async function analyzeImage(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('AI analysis failed')
    return await response.json()
  } catch (error) {
    console.warn('AI service unavailable, using mock analysis:', error.message)
    return getMockAnalysis()
  }
}

/**
 * Generate a mock analysis using the standard stage→progress mapping.
 * If a specific stage is provided, it returns that stage's data;
 * otherwise picks a random one.
 */
export function getMockAnalysis(stage = null) {
  const stageNames = CONSTRUCTION_STAGES

  const idx = stage
    ? stageNames.indexOf(stage)
    : Math.floor(Math.random() * (stageNames.length - 1)) + 1 // skip "Site" for random

  const picked = stageNames[idx] || stageNames[1]
  const prevIdx = Math.max(0, stageNames.indexOf(picked) - 1)
  const nextIdx = Math.min(stageNames.length - 1, stageNames.indexOf(picked) + 1)

  const risks = ['Low', 'Medium', 'High']
  return {
    current_stage: picked,
    completion_percentage: STAGE_PROGRESS_MAP[picked],
    previous_stage: stageNames[prevIdx],
    next_stage: stageNames[nextIdx],
    risk_level: risks[Math.floor(Math.random() * 3)],
    confidence: +(0.7 + Math.random() * 0.25).toFixed(2),
    details: `Construction is at the ${picked} phase. Approximately ${STAGE_PROGRESS_MAP[picked]}% of overall work is complete.`,
  }
}

export async function checkAIHealth() {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}
