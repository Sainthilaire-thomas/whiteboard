import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  Chip,
} from "@mui/material";

interface PratiqueGroup {
  idcategoriepratique: number;
  nomcategorie: string;
  couleur: string;
  pratiques: Array<{
    idpratique: number;
    nompratique: string;
    categoryColor?: string;
  }>;
}

interface PratiqueSelectorSectionProps {
  pratiquesGrouped: PratiqueGroup[];
  selectedPratique: number | null;
  onPratiqueChange: (pratiqueId: number | null) => void;
  loading?: boolean;
  selectedPratiqueData?: {
    nompratique: string;
    categoryName?: string;
    categoryColor?: string;
  } | null;
}

const PratiqueSelectorSection: React.FC<PratiqueSelectorSectionProps> = ({
  pratiquesGrouped,
  selectedPratique,
  onPratiqueChange,
  loading = false,
  selectedPratiqueData,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        💡 Édition des Nudges d'Entraînement
      </Typography>

      {/* Sélecteur de pratique groupé par catégorie */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Sélectionner une pratique</InputLabel>
        <Select
          value={selectedPratique || ""}
          label="Sélectionner une pratique"
          onChange={(e) => onPratiqueChange(Number(e.target.value))}
          disabled={loading}
        >
          {pratiquesGrouped.map((category) => [
            <ListSubheader
              key={`header-${category.idcategoriepratique}`}
              sx={{
                backgroundColor: category.couleur + "20",
                color: category.couleur,
                fontWeight: "bold",
                fontSize: "0.9rem",
                lineHeight: "2.5",
              }}
            >
              {category.nomcategorie}
            </ListSubheader>,
            ...category.pratiques.map((pratique) => (
              <MenuItem
                key={pratique.idpratique}
                value={pratique.idpratique}
                sx={{ pl: 4 }} // Indentation pour les items sous les catégories
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: pratique.categoryColor || "#3f51b5",
                    }}
                  />
                  {pratique.nompratique}
                </Box>
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      {/* Informations de la pratique sélectionnée */}
      {selectedPratique && selectedPratiqueData && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {selectedPratiqueData.nompratique}
          </Typography>
          <Chip
            label={selectedPratiqueData.categoryName}
            size="small"
            sx={{ backgroundColor: selectedPratiqueData.categoryColor + "20" }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PratiqueSelectorSection;
