import { useEffect, useState } from "react";
import { useCalls } from "@/hooks/CallDataContext/useCalls";
import { useCallActivity } from "@/hooks/CallDataContext/useCallActivity";
import { supabaseClient } from "@/lib/supabaseClient";
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
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";

import { useConseiller } from "@/context/ConseillerContext";

interface CallSelectionProps {
  selectedEntreprise: number | null; // ✅ Permet null
  selectCall: (call: any) => void;
}

const CallSelection: React.FC<CallSelectionProps> = ({
  selectedEntreprise,
  selectCall,
}) => {
  // ✅ Utilisation du contexte pour récupérer les conseillers et avatars
  const {
    selectedConseiller,
    setSelectedConseiller,
    conseillers,
    avatarsAnonymes,
    isLoadingConseillers,
  } = useConseiller();

  const {
    calls,
    fetchCalls,
    isLoadingCalls,
    createActivityForCall,
    archiveCall,
    deleteCall,
  } = useCalls();

  const { removeActivityForCall } = useCallActivity();

  // ✅ État pour stocker la nature de l'activité sélectionnée par appel
  const [selectedNatures, setSelectedNatures] = useState<{
    [key: number]: "evaluation" | "coaching";
  }>({});
  const [showConseillerSelect, setShowConseillerSelect] = useState<
    number | null
  >(null);
  const [showDialog, setShowDialog] = useState<number | null>(null);

  // ✅ Fonction pour gérer le changement de nature d'activité
  const handleNatureChange = (
    callId: number,
    value: "evaluation" | "coaching"
  ) => {
    setSelectedNatures((prev) => ({ ...prev, [callId]: value }));
  };

  useEffect(() => {
    if (selectedEntreprise !== null) {
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
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => selectCall(call)}
                      >
                        Évaluer
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<ArchiveIcon />}
                        onClick={() => archiveCall(call.callid)}
                      >
                        Archiver
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteCall(call.callid)}
                      >
                        Supprimer
                      </Button>

                      {/* ✅ Bouton Dissocier si une activité est associée */}
                      {call.callactivityrelation.length > 0 && (
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            await removeActivityForCall(call.callid);

                            // 🔄 Rafraîchir la liste des appels après la dissociation
                            if (selectedEntreprise !== null) {
                              await fetchCalls(selectedEntreprise);
                            }
                          }}
                        >
                          Dissocier
                        </Button>
                      )}

                      {/* ✅ Nouveau bouton "Créer une activité" */}
                      {call.callactivityrelation.length === 0 && (
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => setShowDialog(call.callid)}
                        >
                          ➕ Créer une activité
                        </Button>
                      )}
                    </CardActions>

                    {/* ✅ Dialog (Popup) pour sélectionner Nature + Conseiller */}
                    <Dialog
                      open={showDialog === call.callid}
                      onClose={() => setShowDialog(null)}
                    >
                      <DialogTitle>Créer une activité</DialogTitle>
                      <DialogContent>
                        {/* Sélection de la nature */}
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Type d’activité</InputLabel>
                          <Select
                            value={selectedNatures[call.callid] || "evaluation"}
                            onChange={(e) =>
                              setSelectedNatures((prev) => ({
                                ...prev,
                                [call.callid]: e.target.value as
                                  | "evaluation"
                                  | "coaching",
                              }))
                            }
                          >
                            <MenuItem value="evaluation">Évaluation</MenuItem>
                            <MenuItem value="coaching">Coaching</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Sélection du conseiller avec Avatar */}
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Conseiller</InputLabel>
                          <Select
                            value={
                              selectedConseiller
                                ? `${selectedConseiller.type}-${selectedConseiller.id}`
                                : ""
                            }
                            onChange={(e) => {
                              const [type, id] = e.target.value.split("-");
                              setSelectedConseiller({
                                type: type as "conseiller" | "avatar",
                                id: parseInt(id),
                              });
                            }}
                            renderValue={(value) => {
                              const [type, id] = value.split("-");
                              let displayName = "Inconnu";
                              let avatarUrl = "";

                              if (type === "conseiller") {
                                const conseiller = conseillers.find(
                                  (c) => c.idconseiller === parseInt(id)
                                );
                                if (conseiller) {
                                  displayName = `${conseiller.nom} ${conseiller.prenom}`;
                                  avatarUrl = conseiller.avatarUrl || "";
                                }
                              } else if (type === "avatar") {
                                const avatar = avatarsAnonymes.find(
                                  (a) => a.idavatar === parseInt(id)
                                );
                                if (avatar) {
                                  displayName = avatar.nom;
                                  avatarUrl = avatar.url || "";
                                }
                              }

                              return (
                                <ListItem
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <ListItemAvatar>
                                    <Avatar src={avatarUrl}>
                                      {displayName.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary={displayName} />
                                </ListItem>
                              );
                            }}
                          >
                            {/* 🔥 Ajout des conseillers non anonymes */}
                            {conseillers
                              .filter((c) => !c.estanonyme) // ❌ Supprime les anonymes
                              .map((c) => (
                                <MenuItem
                                  key={`conseiller-${c.idconseiller}`}
                                  value={`conseiller-${c.idconseiller}`}
                                >
                                  <ListItemAvatar>
                                    <Avatar src={c.avatarUrl}>
                                      {c.nom.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={`${c.nom} ${c.prenom}`}
                                  />
                                </MenuItem>
                              ))}

                            {/* 🔥 Ajout des avatars anonymes */}
                            {avatarsAnonymes.map((a) => (
                              <MenuItem
                                key={`avatar-${a.idavatar}`}
                                value={`avatar-${a.idavatar}`}
                              >
                                <ListItemAvatar>
                                  <Avatar src={a.url}>{a.nom.charAt(0)}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={`${a.nom} (Avatar)`} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </DialogContent>

                      <DialogActions>
                        <Button onClick={() => setShowDialog(null)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={async () => {
                            if (!selectedConseiller) {
                              console.warn("⚠️ Aucun conseiller sélectionné !");
                              return;
                            }

                            let idConseiller = selectedConseiller.id;

                            // Vérifier si c'est un avatar anonyme → Créer un conseiller en base
                            if (selectedConseiller.type === "avatar") {
                              const {
                                data: newConseiller,
                                error: createError,
                              } = await supabaseClient
                                .from("conseillers")
                                .insert([
                                  {
                                    nom: "Anonyme",
                                    prenom: "anonyme",
                                    email: null,
                                    entreprise: null,
                                    pseudo: null,
                                    idavatar: selectedConseiller.id,
                                    estanonyme: true,
                                  },
                                ])
                                .select()
                                .single();

                              if (createError) {
                                console.error(
                                  "❌ Erreur lors de la création du conseiller anonyme :",
                                  createError
                                );
                                return;
                              }

                              idConseiller = newConseiller.idconseiller; // Récupérer l'ID créé
                            }

                            // Créer l'activité avec l'ID du conseiller (normal ou anonyme)
                            await createActivityForCall(
                              call.callid,
                              selectedNatures[call.callid] || "evaluation",
                              idConseiller
                            );

                            if (selectedEntreprise !== null) {
                              await fetchCalls(selectedEntreprise);
                            }

                            setShowDialog(null);
                          }}
                          color="primary"
                        >
                          Confirmer
                        </Button>
                      </DialogActions>
                    </Dialog>
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
