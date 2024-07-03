import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import AppWrap from "./AppWrap.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <NextUIProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppWrap />
          </BrowserRouter>
        </ThemeProvider>
      </NextUIProvider>
    </AuthProvider>
  </React.StrictMode>
);
