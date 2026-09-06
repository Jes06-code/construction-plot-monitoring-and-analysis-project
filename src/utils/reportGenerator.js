import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { formatDate, formatCurrency } from './helpers'

export function generateProjectPDF(project = {}, milestones = [], budgetEntries = []) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text('Project Progress Report', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${formatDate(new Date())}`, pageWidth / 2, 28, { align: 'center' })

  // Project Info
  doc.setFontSize(14)
  doc.setTextColor(30)
  doc.text('Project Details', 14, 42)

  doc.setFontSize(10)
  doc.setTextColor(60)

  const info = [
    ['Project Code', project.project_code || 'N/A'],
    ['Title', project.title || 'N/A'],
    ['Location', project.location || 'N/A'],
    ['Status', project.status || 'N/A'],
    ['Deadline', project.deadline ? formatDate(project.deadline) : 'N/A'],
    ['Completion', `${project.completion_percentage || 0}%`],
    ['Investment', formatCurrency(project.investment_commitment || 0)],
    ['Compliance Score', `${project.compliance_score || 0}%`],
  ]

  let y = 50

  info.forEach(([label, value]) => {
    // Prevent page overflow
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    doc.setFont(undefined, 'bold')
    doc.text(`${label}:`, 14, y)

    doc.setFont(undefined, 'normal')

    // Handle long text properly
    const wrappedText = doc.splitTextToSize(String(value), 120)
    doc.text(wrappedText, 70, y)

    // Adjust height based on wrapped lines
    y += wrappedText.length * 6
  })

  // Milestones Section
  if (milestones.length) {
    y += 8

    if (y > 270) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(30)
    doc.text('Milestones', 14, y)

    y += 8

    doc.setFontSize(10)
    doc.setTextColor(60)

    milestones.forEach((m) => {
      // Prevent page overflow BEFORE writing
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      const status = m.completed ? '✓' : '○'

      doc.text(`${status}  ${m.title || 'Untitled Milestone'}`, 14, y)

      doc.text(
        m.target_date ? formatDate(m.target_date) : 'N/A',
        140,
        y
      )

      y += 6
    })
  }

  // Budget Section
  if (budgetEntries.length) {
    y += 8

    if (y > 270) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(30)
    doc.text('Budget Summary', 14, y)

    y += 8

    doc.setFontSize(10)
    doc.setTextColor(60)

    budgetEntries.forEach((b) => {
      // Prevent page overflow BEFORE writing
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      doc.text(b.category || 'General', 14, y)

      doc.text(
        `Allocated: ${formatCurrency(b.allocated || 0)}`,
        80,
        y
      )

      doc.text(
        `Spent: ${formatCurrency(b.spent || 0)}`,
        140,
        y
      )

      y += 6
    })
  }

  doc.save(`${project.project_code || 'project'}-report.pdf`)
}

export function generateProjectExcel(project = {}, milestones = [], budgetEntries = []) {
  const wb = XLSX.utils.book_new()

  // Project Details Sheet
  const projectData = [
    ['Project Code', project.project_code || 'N/A'],
    ['Title', project.title || 'N/A'],
    ['Location', project.location || 'N/A'],
    ['Status', project.status || 'N/A'],
    ['Deadline', project.deadline ? formatDate(project.deadline) : 'N/A'],
    ['Completion %', project.completion_percentage || 0],
    ['Investment', project.investment_commitment || 0],
    ['Compliance Score', project.compliance_score || 0],
    ['Current Stage', project.current_stage || 'N/A'],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet([
    ['Field', 'Value'],
    ...projectData,
  ])

  XLSX.utils.book_append_sheet(wb, ws1, 'Project Details')

  // Milestones Sheet
  if (milestones.length) {
    const msData = milestones.map((m) => [
      m.title || 'Untitled Milestone',
      m.completed ? 'Yes' : 'No',
      m.target_date ? formatDate(m.target_date) : 'N/A',
    ])

    const ws2 = XLSX.utils.aoa_to_sheet([
      ['Milestone', 'Completed', 'Target Date'],
      ...msData,
    ])

    XLSX.utils.book_append_sheet(wb, ws2, 'Milestones')
  }

  // Budget Sheet
  if (budgetEntries.length) {
    const bData = budgetEntries.map((b) => [
      b.category || 'General',
      b.allocated || 0,
      b.spent || 0,
      (b.allocated || 0) - (b.spent || 0),
    ])

    const ws3 = XLSX.utils.aoa_to_sheet([
      ['Category', 'Allocated', 'Spent', 'Remaining'],
      ...bData,
    ])

    XLSX.utils.book_append_sheet(wb, ws3, 'Budget')
  }

  XLSX.writeFile(
    wb,
    `${project.project_code || 'project'}-report.xlsx`
  )
}