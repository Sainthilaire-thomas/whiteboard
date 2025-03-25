"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RawAppProvider } from "./AppContext";
import { CallDataProvider } from "./CallDataContext";

const queryClient = new QueryClient();

interface RootProviderProps {
  children: ReactNode;
}

export default function RootProvider({ children }: RootProviderProps) {
  const [selectedEntreprise, setSelectedEntreprise] = useState<number | null>(
    null
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CallDataProvider selectedEntreprise={selectedEntreprise}>
        <RawAppProvider
          selectedEntreprise={selectedEntreprise}
          setSelectedEntreprise={setSelectedEntreprise}
        >
          {children}
        </RawAppProvider>
      </CallDataProvider>
    </QueryClientProvider>
  );
}
