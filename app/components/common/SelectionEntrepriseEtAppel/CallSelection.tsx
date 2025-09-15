"use client";

import { useEffect, useState, useMemo } from "react";
import { useCallData } from "@/context/CallDataContext";
import { useConseiller } from "@/context/ConseillerContext";
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
  Stack,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchTagsSummaryForCalls } from "./fetchTagsSummaryForCalls"; // ✅ named import

interface CallSelectionProps {
  selectedEntreprise: number | null;
}

export default function CallSelection({
  selectedEntreprise,
}: CallSelectionProps) {
  const {
    calls,
    fetchCalls,
    isLoadingCalls,
    createActivityForCall,
    archiveCall,
    deleteCall,
    removeActivityForCall,
    selectCall,
  } = useCallData();

  const {
    selectedConseiller,
    setSelectedConseiller,
    conseillers,
    avatarsAnonymes,
    isLoadingConseillers,
  } = useConseiller();

  const callsUnique = useMemo(() => {
    const seen = new Set<number>();
    return calls.filter((c) => {
      if (seen.has(c.callid)) return false;
      seen.add(c.callid);
      return true;
    });
  }, [calls]);

  const [selectedNatures, setSelectedNatures] = useState<{
    [key: number]: "evaluation" | "coaching";
  }>({});
  const [showDialog, setShowDialog] = useState<number | null>(null);
  const [tagsByCall, setTagsByCall] = useState<
    Map<number, { call_id: number; count: number }>
  >(new Map());

  useEffect(() => {
    if (selectedEntreprise !== null) {
      fetchCalls(selectedEntreprise);
    }
  }, [selectedEntreprise, fetchCalls]);
  useEffect(() => {
    const run = async () => {
      if (!calls?.length) {
        setTagsByCall(new Map());
        return;
      }
      const ids = calls.map((c) => c.callid);
      const map = await fetchTagsSummaryForCalls(ids);
      setTagsByCall(map);
    };
    run();
  }, [calls]);

  if (isLoadingCalls) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📞 Appels disponibles</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {calls.length > 0 ? (
            <Grid container direction="column" spacing={2}>
              {callsUnique.map((call) => (
                <Grid item xs={12} key={call.callid}>
                  <Card variant="outlined" sx={{ width: "100%" }}>
                    <CardContent>
                      <Typography variant="body1" fontWeight="bold">
                        {call.filename}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {call.description || "Aucune description"}
                      </Typography>

                      {/* Activités existantes */}
                      {call.callactivityrelation.length > 0 ? (
                        call.callactivityrelation.map((relation, rIdx) =>
                          relation.activitesconseillers.map((act, aIdx) => (
                            <Typography
                              key={`${call.callid}-${act.idactivite ?? `${rIdx}-${aIdx}`}-${act.nature}`}
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

                      {/* ✅ Bloc méta */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1 }}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {(() => {
                          const count = tagsByCall.get(call.callid)?.count ?? 0;
                          const has = count > 0;
                          return (
                            <Chip
                              size="small"
                              label={has ? `Taggé (${count})` : "Non taggé"}
                              variant={has ? "filled" : "outlined"}
                            />
                          );
                        })()}
                      </Stack>
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

                      {call.callactivityrelation.length > 0 && (
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            await removeActivityForCall(call.callid);
                            if (selectedEntreprise !== null) {
                              await fetchCalls(selectedEntreprise);
                            }
                          }}
                        >
                          Dissocier
                        </Button>
                      )}

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

                    {/* Dialog pour création d’activité */}
                    <Dialog
                      open={showDialog === call.callid}
                      onClose={() => setShowDialog(null)}
                    >
                      <DialogTitle>Créer une activité</DialogTitle>
                      <DialogContent>
                        {/* Sélection nature */}
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

                        {/* Sélection conseiller */}
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
                                const c = conseillers.find(
                                  (c) => c.idconseiller === parseInt(id)
                                );
                                if (c) {
                                  displayName = `${c.nom} ${c.prenom}`;
                                  avatarUrl = c.avatarUrl || "";
                                }
                              } else {
                                const a = avatarsAnonymes.find(
                                  (a) => a.idavatar === parseInt(id)
                                );
                                if (a) {
                                  displayName = a.nom;
                                  avatarUrl = a.url || "";
                                }
                              }

                              return (
                                <ListItem>
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
                            {conseillers
                              .filter((c) => !c.estanonyme)
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
                            if (!selectedConseiller) return;
                            let idConseiller = selectedConseiller.id;

                            if (selectedConseiller.type === "avatar") {
                              const { data: newConseiller, error } =
                                await supabaseClient
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

                              if (error) {
                                console.error("Erreur création avatar", error);
                                return;
                              }

                              idConseiller = newConseiller.idconseiller;
                            }

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
}
