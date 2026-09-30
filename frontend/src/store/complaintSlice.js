import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  productName: "",
  strength: "",
  batchNumber: "",
  affectedQuantity: "",
  manufacturingDate: "",
  expiryDate: "",
  complaintSource: "",
  customerName: "",
  originatingSite: "",
  complaintCategory: "",
  complaintDescription: "",
  severity: "",
  nextAction: "",
  riskAssessment: ""
}

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    updateComplaintField: (state, action) => {
      const { field, value } = action.payload
      state[field] = value
    },
    setComplaintData: (state, action) => {
      Object.assign(state, action.payload)
    },
    clearComplaint: () => {
      return initialState
    }
  }
})

export const { updateComplaintField, setComplaintData, clearComplaint } = complaintSlice.actions
export default complaintSlice.reducer
