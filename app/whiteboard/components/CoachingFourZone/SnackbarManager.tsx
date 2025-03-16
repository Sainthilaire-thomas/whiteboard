import { useState, useEffect } from "react";
import { Snackbar } from "@mui/material";

type Snack = {
  key: number;
  message: string;
};

type SnackbarManagerProps = {
  snackPack: Snack[];
  setSnackPack: React.Dispatch<React.SetStateAction<Snack[]>>;
};

const SnackbarManager = ({ snackPack, setSnackPack }: SnackbarManagerProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [messageInfo, setMessageInfo] = useState<Snack | undefined>(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false);
    }
  }, [snackPack, messageInfo, open, setSnackPack]);

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <Snackbar
      key={messageInfo?.key}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }} // ✅ Corrige l'erreur en utilisant TransitionProps
      message={messageInfo?.message}
    />
  );
};

export default SnackbarManager;
