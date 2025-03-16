"use client";

import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  SelectChangeEvent,
} from "@mui/material";

interface Conseiller {
  idconseiller: number;
  avatarUrl?: string;
  nom: string;
  estanonyme: boolean;
}

interface AvatarAnonyme {
  idavatar: number;
  url?: string;
  nom: string;
}

interface SelectedValue {
  type: "conseiller" | "avatar";
  id: number;
}

interface SelectionConseillerProps {
  conseillers: Conseiller[];
  avatarsAnonymes: AvatarAnonyme[];
  onSelectionChange: (value: SelectedValue | null) => void;
  selectedValue?: SelectedValue | null;
}

const SelectionConseiller: React.FC<SelectionConseillerProps> = ({
  conseillers,
  avatarsAnonymes,
  onSelectionChange,
  selectedValue,
}) => {
  const [isAnonyme, setIsAnonyme] = useState(false);
  const [selectedConseiller, setSelectedConseiller] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const handleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.startsWith("avatar:")) {
      const avatarId = value.split(":")[1];
      setSelectedAvatar(avatarId);
      setIsAnonyme(true);
      onSelectionChange({ type: "avatar", id: Number(avatarId) });
    } else if (value.startsWith("conseiller:")) {
      const conseillerId = value.split(":")[1];
      setSelectedConseiller(conseillerId);
      setIsAnonyme(false);
      onSelectionChange({ type: "conseiller", id: Number(conseillerId) });
    } else {
      setSelectedAvatar("");
      setSelectedConseiller("");
      setIsAnonyme(false);
      onSelectionChange(null);
    }
  };

  useEffect(() => {
    if (!selectedValue) {
      setSelectedAvatar("");
      setSelectedConseiller("");
      setIsAnonyme(false);
    } else if (selectedValue.type === "avatar") {
      setSelectedAvatar(selectedValue.id.toString());
      setSelectedConseiller("");
      setIsAnonyme(true);
    } else if (selectedValue.type === "conseiller") {
      setSelectedAvatar("");
      setSelectedConseiller(selectedValue.id.toString());
      setIsAnonyme(false);
    }
  }, [selectedValue]);

  return (
    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
      <InputLabel>Conseiller/Avatar</InputLabel>
      <Select
        value={
          isAnonyme && selectedAvatar
            ? `avatar:${selectedAvatar}`
            : !isAnonyme && selectedConseiller
            ? `conseiller:${selectedConseiller}`
            : ""
        }
        onChange={handleChange}
        label="Conseiller/Avatar"
        renderValue={(selectedValue) => {
          if (!selectedValue) return "Aucune Sélection";
          const isAvatarSelected = selectedValue.startsWith("avatar:");
          const id = selectedValue.split(":")[1];

          if (isAvatarSelected) {
            const avatar = avatarsAnonymes.find(
              (avatar) => avatar.idavatar.toString() === id
            );
            return (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={avatar?.url}
                  sx={{ width: 40, height: 40, marginRight: 1 }}
                />
                {avatar?.nom}
              </Box>
            );
          } else {
            const conseiller = conseillers.find(
              (conseiller) => conseiller.idconseiller.toString() === id
            );
            return (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={conseiller?.avatarUrl}
                  sx={{ width: 40, height: 40, marginRight: 1 }}
                />
                {conseiller?.nom}
              </Box>
            );
          }
        }}
      >
        <MenuItem value="">Aucune Sélection</MenuItem>
        {conseillers
          .filter((c) => !c.estanonyme)
          .map((conseiller) => (
            <MenuItem
              key={`conseiller-${conseiller.idconseiller}`}
              value={`conseiller:${conseiller.idconseiller}`}
            >
              <Avatar
                src={conseiller.avatarUrl}
                sx={{ width: 40, height: 40, marginRight: 1 }}
              />
              {conseiller.nom}
            </MenuItem>
          ))}
        {avatarsAnonymes.map((avatar) => (
          <MenuItem
            key={`avatar-${avatar.idavatar}`}
            value={`avatar:${avatar.idavatar}`}
          >
            <Avatar
              src={avatar.url}
              sx={{ width: 40, height: 40, marginRight: 1 }}
            />
            {avatar.nom}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectionConseiller;
