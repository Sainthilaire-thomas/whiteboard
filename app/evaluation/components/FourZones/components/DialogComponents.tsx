// components/DialogComponents.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import { ZONES } from "../constants/zone";
import { EditDialogProps, CategoryDialogProps } from "../types/types";

export const EditPostitDialog: React.FC<EditDialogProps> = ({
  open,
  content,
  onContentChange,
  onClose,
  onSave,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Modifier le post-it</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        fullWidth
        multiline
        rows={3}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Annuler</Button>
      <Button onClick={onSave}>Enregistrer</Button>
    </DialogActions>
  </Dialog>
);

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  text,
  selectedCategory,
  onCategoryChange,
  onClose,
  onSave,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Catégoriser la réponse du conseiller</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Dans quelle catégorie placez-vous cette réponse?
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
        "{text}"
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <FormControlLabel
            value={ZONES.VOUS_AVEZ_FAIT}
            control={<Radio />}
            label="Ce qu'a fait le client"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
              },
            }}
          />
          <FormControlLabel
            value={ZONES.JE_FAIS}
            control={<Radio />}
            label="Ce que je fais"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
              },
            }}
          />
          <FormControlLabel
            value={ZONES.ENTREPRISE_FAIT}
            control={<Radio />}
            label="Ce que fait l'entreprise"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#c0392b",
              },
            }}
          />
          <FormControlLabel
            value={ZONES.VOUS_FEREZ}
            control={<Radio />}
            label="Ce que fera le client"
            sx={{
              ".MuiFormControlLabel-label": {
                color: "#27ae60",
              },
            }}
          />
        </RadioGroup>
      </FormControl>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Annuler</Button>
      <Button onClick={onSave} disabled={!selectedCategory}>
        Catégoriser
      </Button>
    </DialogActions>
  </Dialog>
);
