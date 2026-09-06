import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, FileText, CheckCircle, ArrowLeft, ArrowRight, Upload, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Button from '../components/ui/Button'
import Input, { Select, Textarea } from '../components/ui/Input'
import Card from '../components/ui/Card'
import { generateProjectCode, generatePlotId } from '../utils/helpers'

const STEPS = ['Plot Details', 'Company & Investment', 'Compliance & Deadline', 'Review & Submit']

export default function NewProject() {
  const { user } = useAuth()
  const { addProject, addMilestone, addBudgetEntry, refreshProjects } = useData()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', location: '', latitude: '', longitude: '',
    area_size: '', area_unit: 'sqft', plot_id: generatePlotId(),
    investment_commitment: '', workforce_commitment: '',
    deadline: '', company_name: '', company_contact: '',
    compliance_rules: ['Environmental Clearance', 'Building Safety Permit', 'Fire NOC'],
    newRule: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addRule = () => {
    if (form.newRule.trim()) {
      setForm(prev => ({ ...prev, compliance_rules: [...prev.compliance_rules, prev.newRule.trim()], newRule: '' }))
    }
  }

  const removeRule = (i) => {
    setForm(prev => ({ ...prev, compliance_rules: prev.compliance_rules.filter((_, idx) => idx !== i) }))
  }

  
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));

      const newProject = await addProject({
        title: form.title,
        description: form.description,
        location: form.location,
        latitude: parseFloat(form.latitude) || null,
        longitude: parseFloat(form.longitude) || null,
        area_size: parseFloat(form.area_size) || 0,
        area_unit: form.area_unit,
        plot_id: form.plot_id,
        investment_commitment: parseFloat(form.investment_commitment) || 0,
        workforce_commitment: parseInt(form.workforce_commitment) || 0,
        deadline: form.deadline,
        created_by: user?.id,
      });

      const defaultMilestones = ['Site Preparation', 'Foundation', 'Structural Work', 'Roofing', 'Plastering & Finishing', 'Final Inspection'];
      for (const [i, title] of defaultMilestones.entries()) {
        await addMilestone({ project_id: newProject.id, title, order_index: i + 1, target_date: form.deadline });
      }

      const budgetCategories = [
        { name: 'Labour', pct: 0.25 },
        { name: 'Materials', pct: 0.45 },
        { name: 'Equipment', pct: 0.15 },
        { name: 'Safety and Compliance', pct: 0.05 },
        { name: 'Contingency', pct: 0.03 },
        { name: 'Overhead', pct: 0.07 },
      ];
      const total = parseFloat(form.investment_commitment) || 0;
      for (const cat of budgetCategories) {
        await addBudgetEntry({ project_id: newProject.id, category: cat.name, allocated: Math.round(total * cat.pct), spent: 0 });
      }

      // refreshProjects(); // Disabled to retain locally added project
      navigate('/projects');
    } catch (err) {
      console.error('Project creation failed:', err);
      alert(`Failed to create project: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  }

  const canNext = () => {
    if (step === 0) return form.title && form.location && form.area_size
    if (step === 1) return form.investment_commitment
    if (step === 2) return form.deadline
    return true
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Register New Project</h1>
        <p className="text-sm text-surface-500 mt-1">Fill in the project details to begin monitoring</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
              i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-400 border border-surface-200'
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i <= step ? 'text-surface-700' : 'text-surface-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-emerald-400' : 'bg-surface-200'}`} />}
          </div>
        ))}
      </div>

      <Card hover={false} className="p-6">
        {/* Step 0 */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-base font-semibold text-surface-800 mb-4">Plot & Location Details</h3>
            <Input label="Project Title *" placeholder="e.g., Greenfield Industrial Complex" value={form.title} onChange={e => update('title', e.target.value)} />
            <Textarea label="Description" placeholder="Brief description of the project..." value={form.description} onChange={e => update('description', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Plot ID" value={form.plot_id} onChange={e => update('plot_id', e.target.value)} />
              <Input label="Location *" placeholder="e.g., MIDC Pune" icon={MapPin} value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Area Size *" type="number" placeholder="25000" value={form.area_size} onChange={e => update('area_size', e.target.value)} />
              <Select label="Unit" value={form.area_unit} onChange={e => update('area_unit', e.target.value)} options={[{value:'sqft',label:'Sq. Feet'},{value:'sqm',label:'Sq. Meters'},{value:'acres',label:'Acres'}]} />
              <Input label="Latitude" type="number" placeholder="18.52" value={form.latitude} onChange={e => update('latitude', e.target.value)} />
            </div>
          </motion.div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-base font-semibold text-surface-800 mb-4">Company & Investment</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Company Name" placeholder="BuildTech Industries" value={form.company_name} onChange={e => update('company_name', e.target.value)} />
              <Input label="Contact Person" placeholder="Contact name" value={form.company_contact} onChange={e => update('company_contact', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Investment Commitment (₹) *" type="number" placeholder="45000000" value={form.investment_commitment} onChange={e => update('investment_commitment', e.target.value)} />
              <Input label="Workforce Commitment" type="number" placeholder="120" icon={Users} value={form.workforce_commitment} onChange={e => update('workforce_commitment', e.target.value)} />
            </div>
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
              <div className="flex items-center gap-2 mb-2">
                <Upload size={15} className="text-primary-500" />
                <span className="text-sm font-semibold text-surface-700">Document Uploads</span>
              </div>
              <p className="text-xs text-surface-500">Ownership deeds, approval documents, and other files can be uploaded after project creation from the project detail page.</p>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-base font-semibold text-surface-800 mb-4">Compliance & Deadline</h3>
            <Input label="Project Deadline *" type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Compliance Rules</label>
              <div className="space-y-2 mb-3">
                {form.compliance_rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface-50 border border-surface-200 px-3 py-2.5 rounded-xl">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-surface-700 flex-1">{rule}</span>
                    <button onClick={() => removeRule(i)} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-0.5 rounded hover:bg-red-50 transition-colors">Remove</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a compliance rule..." value={form.newRule} onChange={e => update('newRule', e.target.value)} className="flex-1" />
                <Button variant="secondary" icon={Plus} onClick={addRule}>Add</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-base font-semibold text-surface-800 mb-4">Review & Submit</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Title', form.title], ['Location', form.location], ['Plot ID', form.plot_id],
                ['Area', `${form.area_size} ${form.area_unit}`],
                ['Investment', `₹${parseInt(form.investment_commitment || 0).toLocaleString('en-IN')}`],
                ['Workforce', form.workforce_commitment || 'N/A'],
                ['Deadline', form.deadline], ['Compliance Rules', `${form.compliance_rules.length} rules`],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface-50 border border-surface-100 p-3 rounded-xl">
                  <p className="text-xs text-surface-400 font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-surface-800">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-100">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button icon={ArrowRight} onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Next Step
            </Button>
          ) : (
            <Button icon={CheckCircle} loading={submitting} onClick={handleSubmit}>
              Create Project
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
