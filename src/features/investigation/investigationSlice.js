
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  runInvestigation,
  getCaseInvestigations,
  getInvestigationReport,
  deleteInvestigationReport,
} from "../../api/investigation";

// 1. Run and save an investigation for a case
export const runInvestigationThunk = createAsyncThunk(
  "investigation/runInvestigation",
  async ({ caseId, query, topK = 3 }, { rejectWithValue }) => {
    try {
      return await runInvestigation(caseId, query, topK);
    } catch (error) {
      return rejectWithValue(
        error.message || "Something went wrong during the investigation."
      );
    }
  }
);

// 2. Fetch all investigation reports belonging to a case
export const fetchCaseInvestigations = createAsyncThunk(
  "investigation/fetchCaseInvestigations",
  async (caseId, { rejectWithValue }) => {
    try {
      return await getCaseInvestigations(caseId);
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch investigation history."
      );
    }
  }
);

// 3. Fetch one saved investigation report
export const fetchInvestigationReport = createAsyncThunk(
  "investigation/fetchInvestigationReport",
  async (reportId, { rejectWithValue }) => {
    try {
      return await getInvestigationReport(reportId);
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch investigation report."
      );
    }
  }
);

// 4. Delete a saved investigation report
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

        // Add the newly saved report to the history immediately.
        state.reports = [
          action.payload,
          ...state.reports.filter(
            (item) => item.id !== action.payload.id
          ),
        ];
      })

      .addCase(runInvestigationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Investigation failed.";
      })

      // FETCH CASE INVESTIGATION HISTORY
      .addCase(fetchCaseInvestigations.pending, (state) => {
        state.historyStatus = "loading";
        state.historyError = null;
      })

      .addCase(fetchCaseInvestigations.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.reports = action.payload;
        state.historyError = null;
      })

      .addCase(fetchCaseInvestigations.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.historyError =
          action.payload || "Unable to fetch investigation history.";
      })

      // FETCH SINGLE REPORT
      .addCase(fetchInvestigationReport.pending, (state) => {
        state.reportStatus = "loading";
        state.reportError = null;
        state.selectedReport = null;
      })

      .addCase(fetchInvestigationReport.fulfilled, (state, action) => {
        state.reportStatus = "succeeded";
        state.selectedReport = action.payload;
        state.reportError = null;
      })

      .addCase(fetchInvestigationReport.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.reportError =
          action.payload || "Unable to fetch investigation report.";
      })

      // DELETE REPORT
      .addCase(removeInvestigationReport.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })

      .addCase(removeInvestigationReport.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";

        const reportId = action.payload;

        state.reports = state.reports.filter(
          (item) => item.id !== reportId
        );

        if (state.report?.id === reportId) {
          state.report = null;
        }

        if (state.selectedReport?.id === reportId) {
          state.selectedReport = null;
        }
      })

      .addCase(removeInvestigationReport.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          action.payload || "Unable to delete investigation report.";
      });
  },
});

export const {
  clearInvestigation,
  clearInvestigationHistory,
  clearSelectedReport,
} = investigationSlice.actions;

export default investigationSlice.reducer;
