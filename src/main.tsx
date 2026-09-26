import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CatalogProvider } from "./catalog";
import { MarketplaceProvider } from "./utils/marketplaces";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CatalogProvider>
      <MarketplaceProvider>
        <App />
      </MarketplaceProvider>
    </CatalogProvider>
  </StrictMode>
);
