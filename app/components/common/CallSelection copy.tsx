import { useEffect, useState } from "react";
import { useCalls } from "@/hooks/CallDataContext/useCalls";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  MenuItem,
  Select,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import SelectionConseiller from "./SelectionConseiller"; // ✅ Import du composant
import { useConseillers } from "@/hooks/useConseillers";

interface CallSelectionProps {
  selectedEntreprise: number;
  selectCall: (call: any) => void;
}

const CallSelection: React.FC<CallSelectionProps> = ({
  selectedEntreprise,
  selectCall,
}) => {
  const {
    conseillers,
    avatarsAnonymes,
    isLoading: isLoadingConseillers,
  } = useConseillers();
  const { calls, fetchCalls, isLoadingCalls, createActivityForCall } =
    useCalls();
  // ✅ État pour stocker la nature de l'activité sélectionnée par appel
  const [selectedNatures, setSelectedNatures] = useState<{
    [key: number]: "evaluation" | "coaching";
  }>({});
  const [showConseillerSelect, setShowConseillerSelect] = useState<
    number | null
  >(null);

  // ✅ Fonction pour gérer le changement de nature d'activité
  const handleNatureChange = (
    callId: number,
    value: "evaluation" | "coaching"
  ) => {
    setSelectedNatures((prev) => ({ ...prev, [callId]: value }));
  };

  const [selectedConseiller, setSelectedConseiller] = useState<{
    type: "conseiller" | "avatar";
    id: number;
  } | null>(null);

  useEffect(() => {
    if (selectedEntreprise) {
      fetchCalls(selectedEntreprise);
    }
  }, [selectedEntreprise, fetchCalls]);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📞 Appels disponibles</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {isLoadingCalls ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : calls.length > 0 ? (
            <Grid container direction="column" spacing={2}>
              {calls.map((call) => (
                <Grid item xs={12} key={call.callid}>
                  <Card variant="outlined" sx={{ width: "100%" }}>
                    <CardContent>
                      <Typography variant="body1" fontWeight="bold">
                        {call.filename}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {call.description || "Aucune description"}
                      </Typography>

                      {call.callactivityrelation.length > 0 ? (
                        call.callactivityrelation.map((relation) =>
                          relation.activitesconseillers.map((act) => (
                            <Typography
                              key={act.nature}
                              variant="body2"
                              color="primary"
                            >
                              {act.nature}
                            </Typography>
                          ))
                        )
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Aucune activité associée
                        </Typography>
                      )}
                    </CardContent>

                    <CardActions>
                      {/* ✅ Sélecteur de nature d'activité */}
                      {call.callactivityrelation.length === 0 && (
                        <>
                          <Select
                            size="small"
                            value={selectedNatures[call.callid] || "evaluation"} // 🔹 Récupère la valeur de l'état
                            onChange={(e) =>
                              handleNatureChange(
                                call.callid,
                                e.target.value as "evaluation" | "coaching"
                              )
                            }
                            sx={{ minWidth: 120, mr: 1 }}
                          >
                            <MenuItem value="evaluation">Évaluation</MenuItem>
                            <MenuItem value="coaching">Coaching</MenuItem>
                          </Select>

                          <Button
                            size="small"
                            color="secondary"
                            onClick={() => setShowConseillerSelect(call.callid)}
                          >
                            Assigner un conseiller
                          </Button>
                        </>
                      )}

                      {/* ✅ Sélection du conseiller (affichée uniquement si un appel est sélectionné) */}
                      {showConseillerSelect === call.callid &&
                        (isLoadingConseillers ? (
                          <CircularProgress />
                        ) : (
                          <SelectionConseiller
                            conseillers={conseillers} // ✅ Utilisation du hook
                            avatarsAnonymes={avatarsAnonymes} // ✅ Utilisation du hook
                            selectedValue={null}
                            onSelectionChange={(value) => {
                              if (value) {
                                createActivityForCall(
                                  call.callid,
                                  selectedNatures[call.callid] || "evaluation",
                                  value.id
                                );
                                setShowConseillerSelect(null);
                              }
                            }}
                          />
                        ))}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" textAlign="center">
              Aucun appel disponible.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CallSelection;
