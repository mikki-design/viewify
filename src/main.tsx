import React from "react";
import { Toaster } from "@/components/ui/toaster";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";

import App from "./App";
import {HelmetProvider} from "react-helmet-async";
import { ChatProvider } from "@/context/ChatContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <ChatProvider>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <HelmetProvider>
          <App />
          <Toaster />
           </HelmetProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
    </ChatProvider>
  </React.StrictMode>
);
