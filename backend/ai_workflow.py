import os
import json
from typing import TypedDict

from dotenv import load_dotenv
from groq import Groq
from langgraph.graph import StateGraph, END

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None


class ComplaintState(TypedDict):
    complaint_text: str
    complaint_data: dict
    missing_fields: list
    risk_assessment: dict

def extract_complaint(state: ComplaintState):

    complaint = state["complaint_text"]

    # Groq/Gemma prompt goes here

    return {
        "complaint_data": extracted_data
    }
def check_completeness(state: ComplaintState):

    complaint = state["complaint_data"]

    required_fields = [
        "productName",
        "batchNumber",
        "complaintDescription",
        "customerName"
    ]

    missing_fields = []

    for field in required_fields:

        if not complaint.get(field):
            missing_fields.append(field)

    return {
        "missing_fields": missing_fields
    }
def assess_risk(state: ComplaintState):

    complaint = state["complaint_data"]

    # Send structured complaint to Gemma
    # Generate severity, next action and risk assessment

    return {
        "risk_assessment": {
            "severity": severity,
            "nextAction": next_action,
            "riskAssessment": risk_assessment
        }
    }
workflow = StateGraph(ComplaintState)

workflow.add_node(
    "extract_complaint",
    extract_complaint
)

workflow.add_node(
    "check_completeness",
    check_completeness
)

workflow.add_node(
    "assess_risk",
    assess_risk
)

workflow.set_entry_point("extract_complaint")

workflow.add_edge(
    "extract_complaint",
    "check_completeness"
)

workflow.add_edge(
    "check_completeness",
    "assess_risk"
)

workflow.add_edge(
    "assess_risk",
    END
)

complaint_graph = workflow.compile()
def analyze_complaint(state: ComplaintState):

    complaint = state["complaint_text"]

    if client is None:
        return {
            "analysis": {
                "productName": "",
                "strength": "",
                "batchNumber": "",
                "affectedQuantity": "",
                "complaintCategory": "",
                "customerName": "",
                "complaintDescription": complaint,
                "severity": "Not available",
                "nextAction": "Add GROQ_API_KEY to the backend .env file to enable AI analysis.",
                "riskAssessment": "AI analysis is unavailable because the Groq API key is not configured."
            }
        }

    prompt = f"""
You are an AI assistant for a pharmaceutical
Customer Complaint Management System.

Analyze the following customer complaint.

Complaint:
{complaint}

Return ONLY valid JSON using exactly these fields:

{{
  "productName": "",
  "strength": "",
  "batchNumber": "",
  "affectedQuantity": "",
  "complaintCategory": "",
  "customerName": "",
  "complaintDescription": "",
  "severity": "",
  "nextAction": "",
  "riskAssessment": ""
}}

Rules:

- Use an empty string when information is not available.
- Do not invent information.
- severity must be one of:
  "Critical", "Major", or "Minor".
- Base severity only on the information provided.
- nextAction should describe an appropriate initial complaint-handling action.
- riskAssessment should briefly explain why the complaint may represent
  the stated level of risk.
- Return ONLY the JSON object.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    result = response.choices[0].message.content
    analysis = json.loads(result)

    return {
        "analysis": analysis
    }


workflow = StateGraph(ComplaintState)

workflow.add_node(
    "analyze_complaint",
    analyze_complaint
)

workflow.set_entry_point("analyze_complaint")

workflow.add_edge(
    "analyze_complaint",
    END
)

complaint_graph = workflow.compile()