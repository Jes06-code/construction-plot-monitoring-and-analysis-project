import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, MapPin, Clock, Send, Image as ImageIcon, CheckCircle, Layers } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Select, Textarea } from '../components/ui/Input'
import { formatDateTime } from '../utils/helpers'
import { analyzeImage, getMockAnalysis } from '../lib/ai-service'
import { RISK_COLORS, CONSTRUCTION_STAGES, STAGE_PROGRESS_MAP } from '../utils/constants'

export default function FieldMonitoring() {
  const { user } = useAuth()
  const { projects, uploadStageImage, updateProject } = useData()
  const [selectedProject, setSelectedProject] = useState('')
  const [remarks, setRemarks] = useState('')
  const [amountSpent, setAmountSpent] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [success, setSuccess] = useState(false)
  const [geoLocation, setGeoLocation] = useState(null)
  const fileRef = useRef(null)

  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setGeoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeoLocation({ lat: 18.52, lng: 73.86 })
      )
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setSuccess(false)
    setAnalysis(null)
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const completedStages = selectedProjectData?.stage_images || {}



  const handleUpload = async () => {
    if (!selectedProject || !remarks || !imageFile) return
    // Ensure project is approved (not pending)
    const proj = projects.find(p => p.id === selectedProject)
    if (proj?.status === 'pending') {
      alert('Project must be approved before uploading images.')
      return
    }
    setUploading(true)
    try {
      // Get AI analysis
      const aiResult = await analyzeImage(imageFile)
      const detectedStage = aiResult.current_stage || 'Site'

      setAnalysis(aiResult)

      await uploadStageImage(selectedProject, detectedStage, {
        project_id: selectedProject,
        uploaded_by: user?.id,
        image_url: imagePreview || '',
        remarks,
        latitude: geoLocation?.lat,
        longitude: geoLocation?.lng,
        location_name: selectedProjectData?.location || '',
        captured_at: new Date().toISOString(),
        ai_analysis: aiResult,
        amount_spent: amountSpent ? parseFloat(amountSpent) : 0,
      })

      setSuccess(true)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedProject('')
    setRemarks('')
    setAmountSpent('')
    setImagePreview(null)
    setImageFile(null)
    setAnalysis(null)
    setSuccess(false)
  }

  const projectOptions = projects
  .filter(p => p.status !== 'pending')
  .map(p => ({ value: p.id, label: `${p.project_code || 'NEW'} — ${p.title} (${p.status})` }))

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Field Monitoring</h1>
        <p className="text-sm text-surface-500 mt-1">Upload stage-wise construction progress images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card hover={false} className="p-6">
          <h3 className="text-sm font-semibold text-surface-700 mb-5">Capture Progress</h3>

          <Select
            label="Select Project *"
            placeholder="Choose a project..."
            options={projectOptions}
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="mb-4"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Construction Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${imagePreview ? 'border-primary-300 bg-primary-50' : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                }`}
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <p className="text-xs text-surface-400">Click to change image</p>
                </div>
              ) : (
                <div className="py-6">
                  <Upload size={30} className="text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-500">Click to upload or capture photo</p>
                  <p className="text-xs text-surface-400 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
          </div>

          <Textarea
            label="Remarks *"
            placeholder="Describe the current progress, any issues, or observations..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="mb-4"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Amount Spent (₹)</label>
            <input
              type="number"
              placeholder="e.g. 70000"
              value={amountSpent}
              onChange={e => setAmountSpent(e.target.value)}
              className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
            />
            <p className="text-xs text-surface-500 mt-1">Total cost spent on this stage.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-4 text-xs text-surface-400">
            <span className="flex items-center gap-1"><Clock size={12} /> {formatDateTime(new Date())}</span>
            {geoLocation && <span className="flex items-center gap-1"><MapPin size={12} /> {geoLocation.lat.toFixed(4)}°, {geoLocation.lng.toFixed(4)}°</span>}
          </div>

          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Upload Successful!</span>
              </div>
              <p className="text-xs text-emerald-600">
                AI detected stage "{analysis?.current_stage}" and updated progress to {analysis?.completion_percentage}%.
              </p>
            </motion.div>
          )}

          <div className="flex gap-2">
            <Button
              icon={Send}
              loading={uploading}
              onClick={handleUpload}
              disabled={!selectedProject || !remarks || !imageFile}
              className="flex-1"
            >
              Upload & Analyze
            </Button>
            {success && <Button variant="secondary" onClick={resetForm}>New Upload</Button>}
          </div>
        </Card>

        {/* Right Side — Stage Progress Tracker + AI Result */}
        <div className="space-y-6">

          {/*Stage Progress Tracker  should be placed here, if that option ever required*/}
          {/* AI Analysis Result */}
          <Card hover={false} className="p-6">
            <h3 className="text-sm font-semibold text-surface-700 mb-5">AI Analysis Result</h3>

            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="text-xs text-surface-400 mb-1 font-medium uppercase tracking-wide">Detected Construction Stage</p>
                  <p className="text-xl font-bold text-surface-800">{analysis.current_stage}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.completion_percentage}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-bold text-surface-800">{analysis.completion_percentage}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Previous Stage', value: analysis.previous_stage },
                    { label: 'Next Stage', value: analysis.next_stage },
                    { label: 'Risk Level', value: analysis.risk_level, color: RISK_COLORS[analysis.risk_level] },
                    { label: 'Confidence', value: `${Math.round(analysis.confidence * 100)}%` },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                      <p className="text-[10px] text-surface-400 uppercase tracking-wide font-medium">{label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={color ? { color } : { color: '#1e293b' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {analysis.details && (
                  <div className="p-3 bg-surface-50 border border-surface-100 rounded-xl">
                    <p className="text-[10px] text-surface-400 uppercase tracking-wide font-medium mb-1">Details</p>
                    <p className="text-sm text-surface-600">{analysis.details}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <ImageIcon size={28} className="text-indigo-300" />
                </div>
                <p className="text-surface-400 text-sm font-medium">Upload an image to get AI analysis</p>
                <p className="text-xs text-surface-300 mt-1">The AI will detect the construction stage and progress</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
