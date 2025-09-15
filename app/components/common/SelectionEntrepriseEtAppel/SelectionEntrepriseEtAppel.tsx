// app/components/common/SelectionEntrepriseEtAppel/SelectionEntrepriseEtAppel.tsx
"use client";

import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useAppContext } from "@/context/AppContext";
import CallSelection from "./CallSelection";
import EntrepriseSelection from "./EntrepriseSelection";
import AllCallsBrowser from "./AllCallsBrowser";

export default function SelectionEntrepriseEtAppel() {
  const { selectedEntreprise } = useAppContext();
  const [tab, setTab] = useState<0 | 1>(0); // 0 = Par entreprise, 1 = Tous les appels

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Par entreprise" />
        <Tab label="Tous les appels" />
      </Tabs>

      {tab === 0 && (
        <>
          <EntrepriseSelection />
          <CallSelection selectedEntreprise={selectedEntreprise} />
        </>
      )}
      {tab === 1 && <AllCallsBrowser />}
    </Box>
  );
}
