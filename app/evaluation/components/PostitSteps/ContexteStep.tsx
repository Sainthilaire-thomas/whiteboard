// PostitSteps/ContexteStep.tsx
import React from "react";
import { Box, Typography, TextField, Button, Tabs, Tab } from "@mui/material";
import { Theme, alpha } from "@mui/material/styles";
import { Postit } from "@/types/types";

interface ContexteStepProps {
  selectedPostit: Postit;
  setSelectedPostit: (postit: Postit) => void;
  selectedDomain: string | null;
  showTabs: boolean;
  setShowTabs: (show: boolean) => void;
  filteredDomains: any[];
  selectDomain: (domain: string) => void;
  theme: Theme;
  stepBoxStyle: any;
  styles: any;
  onNext: () => void;
}

export const ContexteStep: React.FC<ContexteStepProps> = ({
  selectedPostit,
  setSelectedPostit,
  selectedDomain,
  showTabs,
  setShowTabs,
  filteredDomains,
  selectDomain,
  theme,
  stepBoxStyle,
  styles,
  onNext,
}) => {
  return (
    <Box sx={stepBoxStyle}>
      <Typography variant="caption" color="text.secondary">
        Passage sélectionné :
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          fontStyle: "italic",
          fontWeight: 400,
          color: "text.primary",
          backgroundColor: alpha(theme.palette.warning.light, 0.1),
          p: 1,
          borderRadius: 1,
        }}
      >
        « {selectedPostit.word} »
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Commentaire à chaud :
      </Typography>
      <TextField
        variant="standard"
        fullWidth
        value={selectedPostit.text || ""}
        onChange={(e) =>
          setSelectedPostit({ ...selectedPostit, text: e.target.value })
        }
        placeholder="Note rapide à chaud..."
        sx={{ mb: 2 }}
      />

      <Typography variant="caption" color="text.secondary">
        Domaine d'analyse :
      </Typography>
      {selectedDomain && !showTabs ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
          <Typography variant="body2" fontWeight={500}>
            {
              filteredDomains.find(
                (d) => d.iddomaine === Number(selectedDomain)
              )?.nomdomaine
            }
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowTabs(true)}
          >
            Changer
          </Button>
        </Box>
      ) : (
        <Box sx={styles.domainSelection}>
          <Tabs
            value={selectedDomain ? String(selectedDomain) : ""}
            onChange={(event, newValue) => {
              selectDomain(String(newValue));
              setShowTabs(false);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {filteredDomains.map((domain) => (
              <Tab
                key={domain.iddomaine}
                label={domain.nomdomaine}
                value={String(domain.iddomaine)}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={onNext} sx={{ mt: 1, mr: 1 }}>
          Continuer vers l'affectation
        </Button>
      </Box>
    </Box>
  );
};
