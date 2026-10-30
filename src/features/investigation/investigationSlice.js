import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { runInvestigation } from "../../api/investigation";

// Async action: calls the Praxia backend
export const runInvestigationThunk = createAsyncThunk(
  "investigation/runInvestigation",
  async ({ query, topK = 3 }, { rejectWithValue }) => {
    try {
      const data = await runInvestigation(query, topK);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Something went wrong during the investigation."
      );
    }
  }
);

const initialState = {
  report: null,
  status: "idle",
  error: null,
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
  },

  extraReducers: (builder) => {
    builder
      .addCase(runInvestigationThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.report = null;
      })

      .addCase(runInvestigationThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.report = action.payload;
        state.error = null;
      })

      .addCase(runInvestigationThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Investigation failed.";
      });
  },
});

export const { clearInvestigation } = investigationSlice.actions;

export default investigationSlice.reducer;