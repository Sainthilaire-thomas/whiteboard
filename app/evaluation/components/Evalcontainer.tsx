import { Box } from "@mui/system";
import BandeauEval from "./BandeauEval";
import { useAppContext } from "@/context/AppContext";

const EvalContainer: React.FC = () => {
  // Récupération du contexte
  const { selectedEntreprise } = useAppContext();

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <BandeauEval selectedEntreprise={selectedEntreprise} />
    </Box>
  );
};

export default EvalContainer;
