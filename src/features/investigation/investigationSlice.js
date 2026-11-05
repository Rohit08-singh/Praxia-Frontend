
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  runInvestigation,
  getCaseInvestigations,
  getInvestigationReport,
  deleteInvestigationReport,
} from "../../api/investigation";

// ==========================================
// 1. RUN AI INVESTIGATION
// ==========================================

export const runInvestigationThunk = createAsyncThunk(
  "investigation/runInvestigation",
  async ({ caseId, query, topK = 3 }, { rejectWithValue }) => {
    try {
      const result = await runInvestigation(caseId, query, topK);
      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || "AI Investigation failed."
      );
    }
  }
);

// ==========================================
// 2. FETCH CASE INVESTIGATION HISTORY
// ==========================================

export const fetchCaseInvestigations = createAsyncThunk(
  "investigation/fetchCaseInvestigations",
  async (caseId, { rejectWithValue }) => {
    try {
      const result = await getCaseInvestigations(caseId);
      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch investigation history."
      );
    }
  }
);

// ==========================================
// 3. FETCH SINGLE INVESTIGATION REPORT
// ==========================================

export const fetchInvestigationReport = createAsyncThunk(
  "investigation/fetchInvestigationReport",
  async (reportId, { rejectWithValue }) => {
    try {
      const result = await getInvestigationReport(reportId);
      return result;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch investigation report."
      );
    }
  }
);

// ==========================================
// 4. DELETE INVESTIGATION REPORT
// ==========================================

export const removeInvestigationReport = createAsyncThunk(
  "investigation/removeInvestigationReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await deleteInvestigationReport(reportId);
      return reportId;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to delete investigation report."
      );
    }
  }
);

// ==========================================
// 5. INITIAL REDUX STATE
// ==========================================

const initialState = {
  report: null,
  reports: [],
  selectedReport: null,

  status: "idle",
  error: null,

  historyStatus: "idle",
  historyError: null,

  reportStatus: "idle",
  reportError: null,

  deleteStatus: "idle",
  deleteError: null,
};

// ==========================================
// 6. INVESTIGATION SLICE
// ==========================================

const investigationSlice = createSlice({
  name: "investigation",
  initialState,

  reducers: {
    clearInvestigation: (state) => {
      state.report = null;
      state.status = "idle";
      state.error = null;
    },

    clearInvestigationHistory: (state) => {
      state.reports = [];
      state.historyStatus = "idle";
      state.historyError = null;
    },

    clearSelectedReport: (state) => {
      state.selectedReport = null;
      state.reportStatus = "idle";
      state.reportError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // RUN INVESTIGATION

      .addCase(runInvestigationThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.report = null;
      })

      .addCase(runInvestigationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.report = action.payload;
        state.error = null;

        state.reports = [
          action.payload,
          ...state.reports.filter(
            (item) => item.id !== action.payload.id
          ),
        ];
      })

      .addCase(runInvestigationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error.message || "Investigation failed.";
      })

      // FETCH INVESTIGATION HISTORY

      .addCase(fetchCaseInvestigations.pending, (state) => {
        state.historyStatus = "loading";
        state.historyError = null;
      })

      .addCase(fetchCaseInvestigations.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.historyError = null;

        const reports = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.reports;

        state.reports = Array.isArray(reports) ? reports : [];
      })

      .addCase(fetchCaseInvestigations.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.historyError =
          action.payload || action.error.message || "History fetch failed.";
      })

      // FETCH SINGLE REPORT

      .addCase(fetchInvestigationReport.pending, (state) => {
        state.reportStatus = "loading";
        state.reportError = null;
      })

      .addCase(fetchInvestigationReport.fulfilled, (state, action) => {
        state.reportStatus = "succeeded";
        state.selectedReport = action.payload;
        state.reportError = null;
      })

      .addCase(fetchInvestigationReport.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.reportError =
          action.payload || action.error.message || "Report fetch failed.";
      })

      // DELETE REPORT

      .addCase(removeInvestigationReport.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })

      .addCase(removeInvestigationReport.fulfilled, (state, action) => {
        const deletedReportId = action.payload;

        state.deleteStatus = "succeeded";

        state.reports = state.reports.filter(
          (item) => item.id !== deletedReportId
        );

        if (state.report?.id === deletedReportId) {
          state.report = null;
        }

        if (state.selectedReport?.id === deletedReportId) {
          state.selectedReport = null;
        }
      })

      .addCase(removeInvestigationReport.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          action.payload || action.error.message || "Report deletion failed.";
      });
  },
});

// ==========================================
// 7. EXPORT ACTIONS AND REDUCER
// ==========================================

export const {
  clearInvestigation,
  clearInvestigationHistory,
  clearSelectedReport,
} = investigationSlice.actions;

export default investigationSlice.reducer;
