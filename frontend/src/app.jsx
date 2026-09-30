import "./app.css"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setComplaintData, updateComplaintField } from "./store/complaintSlice"

const API_URL = "http://127.0.0.1:8000"

function App() {
  const dispatch = useDispatch()
  const complaint = useSelector((state) => state.complaint)
  const [complaints, setComplaints] = useState([])
  const [aiText, setAiText] = useState("")
  const [aiResult, setAiResult] = useState(null)
  const [missingFields, setMissingFields] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [copilotQuestion, setCopilotQuestion] = useState("")
  const [copilotAnswer, setCopilotAnswer] = useState("")
  const [copilotLoading, setCopilotLoading] = useState(false)

  const handleFieldChange = (field) => (event) => {
    dispatch(updateComplaintField({ field, value: event.target.value }))
  }

  const loadComplaints = async () => {
    try {
      const response = await fetch(`${API_URL}/complaints`)
      const data = await response.json()
      setComplaints(data.complaints || [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!complaint.productName.trim() || !complaint.batchNumber.trim() || !complaint.complaintDescription.trim()) {
      alert("Product name, batch number, and complaint description are required.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaint)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Unable to save complaint")
      alert(data.message || "Complaint saved successfully")
      await loadComplaints()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAnalyze = async (text, endpoint = "/analyze-complaint") => {
    setAnalyzing(true)
    try {
      const options = endpoint === "/analyze-pdf"
        ? { method: "POST", body: text }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ complaint_text: text }) }
      const response = await fetch(`${API_URL}${endpoint}`, options)
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail?.riskAssessment || data.detail || "Analysis failed")
      const analysis = data.analysis || data.risk_assessment || {}
      dispatch(setComplaintData(data.complaint || analysis))
      setAiResult(analysis)
      setMissingFields(data.missing_fields || [])
    } catch (error) {
      alert(error.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyzeComplaint = () => {
    const text = aiText.trim() || complaint.complaintDescription.trim()
    if (!text) {
      alert("Please enter a complaint or use the complaint description field.")
      return
    }
    handleAnalyze(text)
  }

  const handlePdfUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    handleAnalyze(formData, "/analyze-pdf")
  }

  const handleCopilot = async () => {
    if (!copilotQuestion.trim()) return
    setCopilotLoading(true)
    try {
      const response = await fetch(`${API_URL}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: copilotQuestion, complaint })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Copilot request failed")
      setCopilotAnswer(data.answer)
    } catch (error) {
      setCopilotAnswer(error.message)
    } finally {
      setCopilotLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>AIVOA</h1>
        <p>Customer Complaint Management System</p>
      </header>
      <div className="main-container">
        <form className="complaint-section" onSubmit={handleSubmit}>
          <h2>Log Customer Complaint</h2>
          <div className="form-section">
            <h3>Product &amp; Batch Identification</h3>
            <div className="form-grid">
              <Field label="Product Name" value={complaint.productName} onChange={handleFieldChange("productName")} />
              <Field label="Strength" value={complaint.strength} onChange={handleFieldChange("strength")} />
              <Field label="Batch Number" value={complaint.batchNumber} onChange={handleFieldChange("batchNumber")} />
              <Field label="Affected Quantity" type="number" value={complaint.affectedQuantity} onChange={handleFieldChange("affectedQuantity")} />
              <Field label="Manufacturing Date" type="date" value={complaint.manufacturingDate} onChange={handleFieldChange("manufacturingDate")} />
              <Field label="Expiry Date" type="date" value={complaint.expiryDate} onChange={handleFieldChange("expiryDate")} />
            </div>
          </div>
          <div className="form-section">
            <h3>Origin &amp; Facility Details</h3>
            <div className="form-grid">
              <Field label="Complaint Source" select value={complaint.complaintSource} onChange={handleFieldChange("complaintSource")} options={["Customer", "Distributor", "Hospital", "Pharmacy", "Email"]} />
              <Field label="Customer Name" value={complaint.customerName} onChange={handleFieldChange("customerName")} />
              <Field label="Originating Site" value={complaint.originatingSite} onChange={handleFieldChange("originatingSite")} />
            </div>
          </div>
          <div className="form-section">
            <h3>Defect Analysis</h3>
            <Field label="Complaint Category" select value={complaint.complaintCategory} onChange={handleFieldChange("complaintCategory")} options={["Product Quality", "Packaging", "Labeling", "Physical Defect", "Other"]} />
            <div className="form-group"><label>Complaint Description</label><textarea rows="5" value={complaint.complaintDescription} onChange={handleFieldChange("complaintDescription")} /></div>
          </div>
          <button className="submit-button" type="submit">Log Customer Complaint</button>
        </form>

        <section className="copilot-section">
          <div className="copilot-header"><h2>AIVOA Copilot</h2><p>AI-powered complaint analysis</p></div>
          <div className="ai-badge">AI Generated</div>
          <div className="copilot-content">
            <label>Complaint / Email</label>
            <textarea rows="8" value={aiText} onChange={(event) => setAiText(event.target.value)} />
            <button className="analyze-button" onClick={handleAnalyzeComplaint} disabled={analyzing}>{analyzing ? "Analyzing..." : "Analyze Complaint"}</button>
            <div className="upload-area"><p>Upload Complaint PDF</p><input type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} /></div>
          </div>
          {aiResult && <div className="risk-card"><p><strong>Suggested Severity:</strong> {aiResult.severity || "Not analyzed"}</p><p><strong>Next Action:</strong> {aiResult.nextAction || "Not analyzed"}</p><p><strong>Initial Risk Assessment:</strong> {aiResult.riskAssessment || "Not analyzed"}</p></div>}
          {missingFields.length > 0 && <div className="missing-fields"><h3>Missing Information</h3><ul>{missingFields.map((field) => <li key={field}>{field}</li>)}</ul></div>}
          <div className="copilot-chat"><h3>Ask AIVOA Copilot</h3><textarea value={copilotQuestion} onChange={(event) => setCopilotQuestion(event.target.value)} /><button className="analyze-button" onClick={handleCopilot} disabled={copilotLoading}>{copilotLoading ? "Thinking..." : "Ask Copilot"}</button>{copilotAnswer && <div className="copilot-answer"><strong>AIVOA Copilot:</strong><p>{copilotAnswer}</p></div>}</div>
        </section>

        <section className="history-section"><h2>Complaint History</h2>{complaints.length === 0 ? <p>No complaints recorded yet.</p> : <div className="complaint-list">{complaints.map((item) => <div className="complaint-card" key={item.id}><h3>{item.productName || "Unknown Product"}</h3><p><strong>Batch:</strong> {item.batchNumber || "N/A"}</p><p><strong>Customer:</strong> {item.customerName || "N/A"}</p><p><strong>Category:</strong> {item.complaintCategory || "N/A"}</p><p><strong>Description:</strong> {item.complaintDescription || "N/A"}</p></div>)}</div>}</section>
      </div>
    </div>
  )
}

function Field({ label, type = "text", value, onChange, select = false, options = [] }) {
  return <div className="form-group"><label>{label}</label>{select ? <select value={value} onChange={onChange}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={type} value={value} onChange={onChange} />}</div>
}

export default App
