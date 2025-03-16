import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircleIcon from "@mui/icons-material/Circle";
import { supabaseClient } from "@/lib/supabaseClient";
import FilterInput from "./FilterInput";
import AudioUploadModal from "./AudioUploadModal";
import { uploadAudio } from "./audioUploadUtils";
import { generateSignedUrl } from "./supabaseUtils";

// 📦 Types
interface Call {
  callid: string;
  filename: string;
  origine?: string; // ✅ Ajout de la propriété origine
  description?: string;
  duree?: number;
  status: "conflictuel" | "non_conflictuel" | "non_supervisé" | string;
  audiourl?: string;
  filepath?: string;
  transcription?: {
    words: Word[];
  };
}

interface Word {
  turn: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface CallListUnpreparedProps {
  onPrepareCall: ({
    call,
    showMessage,
  }: {
    call: Call;
    showMessage: (msg: string) => void;
  }) => Promise<void>;
  showMessage: (message: string) => void;
}

// 🚀 Composant principal
const CallListUnprepared = ({
  onPrepareCall,
  showMessage,
}: CallListUnpreparedProps) => {
  const [callsByOrigin, setCallsByOrigin] = useState<Record<string, Call[]>>(
    {}
  );
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [filteredCallsByOrigin, setFilteredCallsByOrigin] = useState<
    Record<string, Call[]>
  >({});
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [callBeingPrepared, setCallBeingPrepared] = useState<Call | null>(null);

  useEffect(() => {
    const fetchUnpreparedCalls = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("call")
          .select("*")
          .eq("preparedfortranscript", false);

        if (error) {
          console.error("Erreur lors du chargement des appels :", error);
          showMessage("Erreur lors du chargement des appels.");
          return;
        }

        const groupedByOrigin = (data as Call[]).reduce(
          (acc: Record<string, Call[]>, call) => {
            const origin = call.origine ?? "Inconnue";
            acc[origin] = acc[origin] ? [...acc[origin], call] : [call];
            return acc;
          },
          {}
        );

        setCallsByOrigin(groupedByOrigin);
        setFilteredCallsByOrigin(groupedByOrigin);
      } catch (err) {
        console.error("Erreur inattendue :", err);
        showMessage("Erreur inattendue lors du chargement.");
      }
    };

    fetchUnpreparedCalls();
  }, [showMessage]);

  useEffect(() => {
    const updatedFilteredCalls = Object.entries(callsByOrigin).reduce(
      (acc: Record<string, Call[]>, [origin, calls]) => {
        const keyword = filterKeyword.trim().toLowerCase();

        const matchingCalls = calls.filter((call) => {
          const matchesKeyword =
            !keyword || call.filename.toLowerCase().includes(keyword);
          const matchesStatus =
            filterStatus === "all" || call.status === filterStatus;
          return matchesKeyword && matchesStatus;
        });

        if (matchingCalls.length > 0) acc[origin] = matchingCalls;
        return acc;
      },
      {}
    );

    setFilteredCallsByOrigin(updatedFilteredCalls);
  }, [callsByOrigin, filterKeyword, filterStatus]);

  const handlePrepareCallClick = (call: Call) => {
    setCallBeingPrepared(call);
    setIsAudioModalOpen(true);
  };

  const handleAudioUpload = async (audioFile: File) => {
    if (!callBeingPrepared) return;

    try {
      const filePath = await uploadAudio(audioFile);
      const audioUrl = await generateSignedUrl(filePath);

      const { error } = await supabaseClient
        .from("call")
        .update({ audiourl: audioUrl, filepath: filePath, upload: true })
        .eq("callid", callBeingPrepared.callid);

      if (error) throw new Error(error.message);

      showMessage("Fichier audio associé avec succès !");
      await onPrepareCall({ call: callBeingPrepared, showMessage });
    } catch (error) {
      console.error("Erreur lors de l'association de l'audio :", error);
      showMessage(`Erreur : ${(error as Error).message}`);
    } finally {
      setIsAudioModalOpen(false);
    }
  };

  const handleViewJSONB = (call: Call) => {
    setSelectedCall(call);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCall(null);
    setDialogOpen(false);
  };

  const getStatusColor = (status: Call["status"]) => {
    switch (status) {
      case "conflictuel":
        return "red";
      case "non_conflictuel":
        return "green";
      case "non_supervisé":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <div>
      <Box mb={2} display="flex" justifyContent="space-between">
        <Typography variant="h6">Filtrer par statut :</Typography>
        <Box>
          {["all", "non_supervisé", "conflictuel", "non_conflictuel"].map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "contained" : "outlined"}
                onClick={() => setFilterStatus(status)}
              >
                {status.replace("_", " ")}
              </Button>
            )
          )}
        </Box>
      </Box>

      <FilterInput
        filterValue={filterKeyword}
        setFilterValue={setFilterKeyword}
      />

      {Object.entries(filteredCallsByOrigin).map(([origin, calls]) => (
        <Accordion key={origin}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {origin} ({calls.length} appels)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Statut</TableCell>
                    <TableCell>Fichier</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Durée (s)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calls.map((call) => (
                    <TableRow key={call.callid}>
                      <TableCell>
                        <CircleIcon
                          style={{
                            color: getStatusColor(call.status),
                            fontSize: "1.5rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>{call.filename}</TableCell>
                      <TableCell>
                        {call.description ?? "Pas de description"}
                      </TableCell>
                      <TableCell>{call.duree ?? "Inconnue"}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewJSONB(call)}
                        >
                          Voir JSONB
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handlePrepareCallClick(call)}
                        >
                          Préparer pour le tagging
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Transcription de l'appel</DialogTitle>
        <DialogContent>
          {selectedCall?.transcription ? (
            selectedCall.transcription.words.map((word, index) => (
              <Box
                key={index}
                p={1}
                bgcolor={index % 2 === 0 ? "#f0f0f0" : "#e0e0e0"}
              >
                <Typography>
                  <strong>{word.turn}:</strong> [{word.startTime} -{" "}
                  {word.endTime}] {word.text}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>Aucune transcription disponible.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <AudioUploadModal
        open={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onUpload={handleAudioUpload}
      />
    </div>
  );
};

export default CallListUnprepared;
