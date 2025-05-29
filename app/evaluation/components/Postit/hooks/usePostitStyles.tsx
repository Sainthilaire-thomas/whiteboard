import { useMemo } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

export const usePostitStyles = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const styles = useMemo(
    () => ({
      modalBackground: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: theme.zIndex.modal,
      },
      modalWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        outline: "none",
        overflowY: "auto",
        padding: theme.spacing(2),
      },
      modalContainer: {
        position: "relative",
        width: isMobile ? "95%" : "80%",
        maxWidth: 800,
        maxHeight: "95vh",
        overflowY: "auto",
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[24],
        outline: "none",
      },
      stepBox: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(1),
        padding: theme.spacing(1, 2),
      },
      stepper: {
        backgroundColor: alpha(theme.palette.grey[100], 0.5),
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1),
      },
      stepperMobile: {
        flexGrow: 1,
        borderRadius: theme.shape.borderRadius,
        "& .MuiLinearProgress-root": {
          height: 6,
          borderRadius: 3,
        },
      },
    }),
    [theme, isMobile]
  );

  const stepBoxStyle = useMemo(
    () => ({
      bgcolor: alpha(
        theme.palette.grey[100],
        theme.palette.mode === "dark" ? 0.05 : 1
      ),
      borderRadius: 2,
      border: "1px solid",
      borderColor: theme.palette.divider,
      boxShadow: 1,
      p: 2,
      mb: 2,
    }),
    [theme]
  );

  return {
    theme,
    isMobile,
    styles,
    stepBoxStyle,
  };
};

// Style des étapes de navigation
export const getStepStyles = (theme, isActive, isCompleted) => ({
  stepIcon: {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: `2px solid ${
      isCompleted
        ? theme.palette.success.main
        : isActive
        ? theme.palette.primary.main
        : theme.palette.grey[400]
    }`,
    color: isCompleted
      ? theme.palette.success.main
      : isActive
      ? theme.palette.primary.main
      : theme.palette.grey[600],
    backgroundColor: "transparent",
    transition: "all 0.2s ease",
  },
});
