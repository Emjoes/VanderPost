import "./index.css";
import App from "./App";
import i18n from "./locale";
import { I18nextProvider } from "react-i18next";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);