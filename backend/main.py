from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

from ai_workflow import complaint_graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5175",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

complaints_db = []


class Complaint(BaseModel):
    productName: str = ""
    strength: str = ""
    batchNumber: str = ""
    affectedQuantity: str = ""
    manufacturingDate: str = ""
    expiryDate: str = ""
    complaintSource: str = ""
    customerName: str = ""
    originatingSite: str = ""
    complaintCategory: str = ""
    complaintDescription: str = ""


class ComplaintRequest(BaseModel):
    complaint_text: str


@app.get("/")
def home():
    return {"message": "AIVOA Backend is running"}


@app.post("/complaints")
def create_complaint(complaint: Complaint):
    complaint_payload = complaint.model_dump()
    complaint_payload["id"] = len(complaints_db) + 1
    complaints_db.append(complaint_payload)
    return {"message": "Complaint saved successfully", "complaint_id": complaint_payload["id"]}


@app.get("/complaints")
def get_complaints():
    return {"complaints": complaints_db}


@app.post("/analyze-complaint")
def analyze_complaint(request: ComplaintRequest):
    result = complaint_graph.invoke({
        "complaint_text": request.complaint_text,
        "analysis": ""
    })

    analysis = result.get("analysis", {})
    if isinstance(analysis, dict) and analysis.get("riskAssessment") == "AI analysis is unavailable because the Groq API key is not configured.":
        raise HTTPException(status_code=500, detail=analysis)

    return {"analysis": analysis}


@app.post("/copilot")
def copilot(payload: dict):
    complaint = payload.get("complaint", {})
    question = payload.get("question", "")

    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")

    answer = (
        f"Based on the complaint, the key issue is: {complaint.get('complaintDescription', 'No description provided')}. "
        f"Please review the complaint details and confirm the next operational step."
    )
    return {"answer": answer}
@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    contents = await file.read()

    reader = PdfReader(BytesIO(contents))

    extracted_text = ""

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text += text + "\n"

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the PDF."
        )

    result = complaint_graph.invoke({
        "complaint_text": extracted_text,
        "complaint_data": {},
        "missing_fields": [],
        "risk_assessment": {}
    })

    return {
        "extracted_text": extracted_text,
        "complaint": result["complaint_data"],
        "missing_fields": result["missing_fields"],
        "risk_assessment": result["risk_assessment"]
    }
