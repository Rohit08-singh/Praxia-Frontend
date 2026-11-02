
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
} from "../../api/cases";

// Fetch all cases
export const fetchCases = createAsyncThunk(
  "cases/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllCases();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch one case
export const fetchCaseById = createAsyncThunk(
  "cases/fetchById",
  async (caseId, { rejectWithValue }) => {
    try {
      return await getCaseById(caseId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a case
export const addCase = createAsyncThunk(
  "cases/create",
  async (caseData, { rejectWithValue }) => {
    try {
      return await createCase(caseData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update a case
export const editCase = createAsyncThunk(
  "cases/update",
  async ({ caseId, updates }, { rejectWithValue }) => {
    try {
      return await updateCase(caseId, updates);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a case
export const removeCase = createAsyncThunk(
  "cases/delete",
  async (caseId, { rejectWithValue }) => {
    try {
      await deleteCase(caseId);
      return caseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  selectedCase: null,

  loading: {
    list: false,
    details: false,
    create: false,
    update: false,
    delete: false,
  },

  error: null,
};

const casesSlice = createSlice({
  name: "cases",
  initialState,

  reducers: {
    clearSelectedCase(state) {
      state.selectedCase = null;
    },

    clearCasesError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // LIST CASES
      .addCase(fetchCases.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading.list = false;
        state.items = action.payload;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload;
      })

      // GET CASE DETAILS
      .addCase(fetchCaseById.pending, (state) => {
        state.loading.details = true;
        state.error = null;
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedCase = action.payload;
      })
      .addCase(fetchCaseById.rejected, (state, action) => {
        state.loading.details = false;
        state.error = action.payload;
      })

      // CREATE CASE
      .addCase(addCase.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(addCase.fulfilled, (state, action) => {
        state.loading.create = false;
        state.items.unshift(action.payload);
      })
      .addCase(addCase.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      })

      // UPDATE CASE
      .addCase(editCase.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(editCase.fulfilled, (state, action) => {
        state.loading.update = false;

        const updatedCase = action.payload;

        const index = state.items.findIndex(
          (item) => item.id === updatedCase.id
        );

        if (index !== -1) {
          state.items[index] = updatedCase;
        }

        if (state.selectedCase?.id === updatedCase.id) {
          state.selectedCase = updatedCase;
        }
      })
      .addCase(editCase.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      })

      // DELETE CASE
      .addCase(removeCase.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(removeCase.fulfilled, (state, action) => {
        state.loading.delete = false;

        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );

        if (state.selectedCase?.id === action.payload) {
          state.selectedCase = null;
        }
      })
      .addCase(removeCase.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedCase,
  clearCasesError,
} = casesSlice.actions;

export default casesSlice.reducer;
