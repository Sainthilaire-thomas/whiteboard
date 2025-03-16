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
  type: "avatar" | "conseiller";
  id: number;
}

interface SelectionConseillerProps {
  conseillers: Conseiller[];
  avatarsAnonymes: AvatarAnonyme[];
  onSelectionChange: (value: SelectedValue | null) => void;
  selectedValue?: SelectedValue | null;
}

const SelectionConseiller: React.FC<SelectionConseillerProps> = ({
  conseillers = [], // ✅ Valeur par défaut pour éviter undefined
  avatarsAnonymes = [], // ✅ Valeur par défaut
  onSelectionChange,
  selectedValue,
}) => {
  const [isAnonyme, setIsAnonyme] = useState<boolean>(false);
  const [selectedConseiller, setSelectedConseiller] = useState<number | null>(
    null
  );
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;

    if (value.startsWith("avatar:")) {
      const avatarId = Number(value.split(":")[1]);
      setSelectedAvatar(avatarId);
      setIsAnonyme(true);
      onSelectionChange({ type: "avatar", id: avatarId });
    } else if (value.startsWith("conseiller:")) {
      const conseillerId = Number(value.split(":")[1]);
      setSelectedConseiller(conseillerId);
      setIsAnonyme(false);
      onSelectionChange({ type: "conseiller", id: conseillerId });
    } else {
      setSelectedAvatar(null);
      setSelectedConseiller(null);
      setIsAnonyme(false);
      onSelectionChange(null);
    }
  };

  useEffect(() => {
    if (!selectedValue) {
      setSelectedAvatar(null);
      setSelectedConseiller(null);
      setIsAnonyme(false);
    } else if (selectedValue.type === "avatar") {
      setSelectedAvatar(selectedValue.id);
      setSelectedConseiller(null);
      setIsAnonyme(true);
    } else if (selectedValue.type === "conseiller") {
      setSelectedAvatar(null);
      setSelectedConseiller(selectedValue.id);
      setIsAnonyme(false);
    }
  }, [selectedValue]);

  return (
    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
      <InputLabel>Conseiller/Avatar</InputLabel>
      <Select
        value={
          isAnonyme && selectedAvatar !== null
            ? `avatar:${selectedAvatar}`
            : !isAnonyme && selectedConseiller !== null
            ? `conseiller:${selectedConseiller}`
            : ""
        }
        onChange={handleChange}
        label="Conseiller/Avatar"
        renderValue={(selected) => {
          if (!selected) return "Aucune Sélection";
          const value = selected as string;
          const isAvatarSelected = value.startsWith("avatar:");
          const id = Number(value.split(":")[1]);

          if (isAvatarSelected) {
            const avatar = avatarsAnonymes.find((a) => a.idavatar === id);
            return (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={avatar?.url}
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
                {avatar?.nom ?? "Avatar inconnu"}
              </Box>
            );
          } else {
            const conseiller = conseillers.find((c) => c.idconseiller === id);
            return (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={conseiller?.avatarUrl}
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
                {conseiller?.nom ?? "Conseiller inconnu"}
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
                sx={{ width: 40, height: 40, mr: 1 }}
              />
              {conseiller.nom}
            </MenuItem>
          ))}
        {avatarsAnonymes.map((avatar) => (
          <MenuItem
            key={`avatar-${avatar.idavatar}`}
            value={`avatar:${avatar.idavatar}`}
          >
            <Avatar src={avatar.url} sx={{ width: 40, height: 40, mr: 1 }} />
            {avatar.nom}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectionConseiller;
