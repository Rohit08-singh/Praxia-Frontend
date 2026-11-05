
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  uploadDocument,
  getCaseDocuments,
  getDocumentById,
  deleteDocument,
} from "../../api/documents";

// ==========================================
// 1. UPLOAD DOCUMENT
// ==========================================

export const uploadDocumentThunk = createAsyncThunk(
  "documents/uploadDocument",
  async ({ caseId, file }, { rejectWithValue }) => {
    try {
      return await uploadDocument(caseId, file);
    } catch (error) {
      return rejectWithValue(
        error.message || "Document upload failed."
      );
    }
  }
);

// ==========================================
// 2. FETCH CASE DOCUMENTS
// ==========================================

export const fetchCaseDocuments = createAsyncThunk(
  "documents/fetchCaseDocuments",
  async (caseId, { rejectWithValue }) => {
    try {
      return await getCaseDocuments(caseId);
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch documents."
      );
    }
  }
);

// ==========================================
// 3. FETCH SINGLE DOCUMENT
// ==========================================

export const fetchDocumentDetails = createAsyncThunk(
  "documents/fetchDocumentDetails",
  async (documentId, { rejectWithValue }) => {
    try {
      return await getDocumentById(documentId);
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch document details."
      );
    }
  }
);

// ==========================================
// 4. DELETE DOCUMENT
// ==========================================

export const removeDocument = createAsyncThunk(
  "documents/removeDocument",
  async (documentId, { rejectWithValue }) => {
    try {
      await deleteDocument(documentId);
      return documentId;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to delete document."
      );
    }
  }
);

// ==========================================
// 5. INITIAL STATE
// ==========================================

const initialState = {
  documents: [],
  selectedDocument: null,

  status: "idle",
  error: null,

  uploadStatus: "idle",
  uploadError: null,

  detailsStatus: "idle",
  detailsError: null,

  deleteStatus: "idle",
  deleteError: null,
};

// ==========================================
// 6. DOCUMENT SLICE
// ==========================================

const documentsSlice = createSlice({
  name: "documents",
  initialState,

  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
      state.status = "idle";
      state.error = null;
    },

    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
      state.detailsStatus = "idle";
      state.detailsError = null;
    },

    clearDocumentErrors: (state) => {
      state.error = null;
      state.uploadError = null;
      state.detailsError = null;
      state.deleteError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------------------
      // FETCH CASE DOCUMENTS
      // --------------------------------------

      .addCase(fetchCaseDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchCaseDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documents = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(fetchCaseDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error.message || "Unable to fetch documents.";
      })

      // --------------------------------------
      // UPLOAD DOCUMENT
      // --------------------------------------

      .addCase(uploadDocumentThunk.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
      })

      .addCase(uploadDocumentThunk.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";

        const uploadedDocument = action.payload;

        state.documents = [
          uploadedDocument,
          ...state.documents.filter(
            (document) => document.id !== uploadedDocument.id
          ),
        ];
      })

      .addCase(uploadDocumentThunk.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.uploadError =
          action.payload || action.error.message || "Document upload failed.";
      })

      // --------------------------------------
      // FETCH SINGLE DOCUMENT
      // --------------------------------------

      .addCase(fetchDocumentDetails.pending, (state) => {
        state.detailsStatus = "loading";
        state.detailsError = null;
      })

      .addCase(fetchDocumentDetails.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.selectedDocument = action.payload;
      })

      .addCase(fetchDocumentDetails.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.detailsError =
          action.payload || action.error.message || "Unable to fetch document.";
      })

      // --------------------------------------
      // DELETE DOCUMENT
      // --------------------------------------

      .addCase(removeDocument.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })

      .addCase(removeDocument.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";

        const deletedId = action.payload;

        state.documents = state.documents.filter(
          (document) => document.id !== deletedId
        );

        if (state.selectedDocument?.id === deletedId) {
          state.selectedDocument = null;
          state.detailsStatus = "idle";
        }
      })

      .addCase(removeDocument.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          action.payload || action.error.message || "Document deletion failed.";
      });
  },
});

// ==========================================
// 7. EXPORT ACTIONS AND REDUCER
// ==========================================

export const {
  clearDocuments,
  clearSelectedDocument,
  clearDocumentErrors,
} = documentsSlice.actions;

export default documentsSlice.reducer;
