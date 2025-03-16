// 📜 components/evaluation/EvaluationTranscript.tsx
"use client";

import { Box } from "@mui/material";
import { useCallData } from "@/context/CallDataContext";
import Transcript from "./Transcript";

export default function EvaluationTranscript() {
  const { selectedCall } = useCallData();

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 1,
        px: 4,
        overflowY: "auto",
        height: "100%",
      }}
    >
      {selectedCall && (
        <Transcript
          callId={selectedCall.callid}
          audioSrc={selectedCall.audiourl ?? ""} // ✅ Fournit une valeur par défaut
        />
      )}
    </Box>
  );
}
