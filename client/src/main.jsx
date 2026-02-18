import "@fontsource/plus-jakarta-sans/latin.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./Redux/store.js"; // ✅ import your Redux store
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ✅ Wrap your entire app in Redux Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
