"use client";

import React, { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RawAppProvider } from "./AppContext";
import { CallDataProvider } from "./CallDataContext";
import { AudioProvider } from "./AudioContext";

// Composant pour gérer les erreurs au niveau de l'application
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Oups ! Une erreur s'est produite.</h2>
          <p>
            L'application a rencontré un problème. Veuillez rafraîchir la page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: "8px 16px", marginTop: "10px" }}
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

interface RootProviderProps {
  children: ReactNode;
}

export default function RootProvider({ children }: RootProviderProps) {
  const [selectedEntreprise, setSelectedEntreprise] = useState<number | null>(
    null
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <CallDataProvider selectedEntreprise={selectedEntreprise}>
            <RawAppProvider
              selectedEntreprise={selectedEntreprise}
              setSelectedEntreprise={setSelectedEntreprise}
            >
              {children}
            </RawAppProvider>
          </CallDataProvider>
        </AudioProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
