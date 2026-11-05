import { configureStore } from "@reduxjs/toolkit";

import investigationReducer from "../features/investigation/investigationSlice";
import casesReducer from "../features/cases/casesSlice";
import documentsReducer from "../features/documents/documentsSlice";

export const store = configureStore({
  reducer: {
    investigation: investigationReducer,
    cases: casesReducer,
    documents: documentsReducer,
  },
});
