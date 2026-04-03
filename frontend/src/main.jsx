import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import App from "./App";

const shop = new URLSearchParams(window.location.search).get("shop") || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider i18n={en}>
      <BrowserRouter>
        <App shop={shop} />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);