// app/components/common/SelectionEntrepriseEtAppel/AllCallsBrowser.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Stack,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppContext } from "@/context/AppContext";
import { useCallData } from "@/context/CallDataContext";
import { useCallsSummary, type CallsFilters } from "./hooks/useCallsSummary";

type ArchiveTab = "all" | "active" | "archived";
type TriBool = "all" | "yes" | "no";

type Order = "asc" | "desc";
type OrderBy =
  | "filename"
  | "identreprise"
  | "activity_count"
  | "tag_count"
  | "postit_count"
  | "has_transcript"
  | "archived"
  | "duree"
  | "status";

function fmtDuration(seconds?: number | null) {
  if (!seconds && seconds !== 0) return "—";
  const s = Math.max(0, Math.floor(Number(seconds)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function AllCallsBrowser() {
  // —————————————————————————————————————————
  // Filtres “serveur”
  // —————————————————————————————————————————
  const { entreprises } = useAppContext();
  const [archiveTab, setArchiveTab] = useState<ArchiveTab>("active");
  const archived =
    archiveTab === "all" ? null : archiveTab === "archived" ? true : false;

  const [filters, setFilters] = useState<CallsFilters>({
    archived,
    identreprise: null,
    onlyUnassigned: false,
  });

  // garder filters.archived en phase
  if (filters.archived !== archived) {
    setFilters((f) => ({ ...f, archived }));
  }

  const { data: rowsRaw = [], isLoading } = useCallsSummary(filters);

  // —————————————————————————————————————————
  // Dédup local (au cas où la vue renverrait des doublons)
  // —————————————————————————————————————————
  const rows = useMemo(() => {
    const seen = new Set<number>();
    return rowsRaw.filter((r: any) => {
      if (seen.has(r.callid)) return false;
      seen.add(r.callid);
      return true;
    });
  }, [rowsRaw]);

  // —————————————————————————————————————————
  // Filtres “client” (colonnes)
  // —————————————————————————————————————————
  const [qName, setQName] = useState("");
  const [qTranscript, setQTranscript] = useState<TriBool>("all");
  const [qMinTags, setQMinTags] = useState<string>("");
  const [qMinActs, setQMinActs] = useState<string>("");
  const [qMinPostits, setQMinPostits] = useState<string>("");
  const [qStatus, setQStatus] = useState("");
  const [qDurMin, setQDurMin] = useState<string>(""); // en secondes

  // —————————————————————————————————————————
  // Tri
  // —————————————————————————————————————————
  const [orderBy, setOrderBy] = useState<OrderBy>("filename");
  const [order, setOrder] = useState<Order>("asc");

  function handleSort(col: OrderBy) {
    if (orderBy === col) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(col);
      setOrder("asc");
    }
  }

  const filtered = useMemo(() => {
    const minTags = qMinTags ? Number(qMinTags) : null;
    const minActs = qMinActs ? Number(qMinActs) : null;
    const minPost = qMinPostits ? Number(qMinPostits) : null;
    const minDur = qDurMin ? Number(qDurMin) : null;

    let out = rows.filter((r: any) => {
      if (
        qName &&
        !String(r.filename ?? "")
          .toLowerCase()
          .includes(qName.toLowerCase())
      )
        return false;
      if (qTranscript === "yes" && !r.has_transcript) return false;
      if (qTranscript === "no" && r.has_transcript) return false;
      if (minTags !== null && Number(r.tag_count ?? 0) < minTags) return false;
      if (minActs !== null && Number(r.activity_count ?? 0) < minActs)
        return false;
      if (minPost !== null && Number(r.postit_count ?? 0) < minPost)
        return false;
      if (
        qStatus &&
        String(r.status ?? "").toLowerCase() !== qStatus.toLowerCase()
      )
        return false;
      if (minDur !== null) {
        const dur = Number(r.duree ?? r.duration_sec ?? 0);
        if (dur < minDur) return false;
      }
      return true;
    });

    const dir = order === "asc" ? 1 : -1;
    out.sort((a: any, b: any) => {
      const A = a[orderBy];
      const B = b[orderBy];
      // booleans → 0/1, undefined last
      const norm = (v: any) =>
        v === undefined || v === null
          ? order === "asc"
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY
          : typeof v === "boolean"
            ? v
              ? 1
              : 0
            : typeof v === "string"
              ? v.toLowerCase()
              : Number(v);
      const x = norm(A);
      const y = norm(B);
      if (x < y) return -1 * dir;
      if (x > y) return 1 * dir;
      // tie-breaker
      return (Number(a.callid) - Number(b.callid)) * dir;
    });

    return out;
  }, [
    rows,
    qName,
    qTranscript,
    qMinTags,
    qMinActs,
    qMinPostits,
    qStatus,
    qDurMin,
    orderBy,
    order,
  ]);

  // actions
  const { selectCall, archiveCall, deleteCall } = useCallData();

  return (
    <Box sx={{ p: 2 }}>
      {/* Barre de filtres “serveur” */}
      <Toolbar sx={{ gap: 2, flexWrap: "wrap", px: 0 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Filtrer par entreprise</InputLabel>
          <Select
            label="Filtrer par entreprise"
            value={filters.onlyUnassigned ? "" : (filters.identreprise ?? "")}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                identreprise: e.target.value ? Number(e.target.value) : null,
                onlyUnassigned: false,
              }))
            }
          >
            <MenuItem value="">(Toutes)</MenuItem>
            {entreprises.map((e) => (
              <MenuItem key={e.identreprise} value={e.identreprise}>
                {e.nomentreprise}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={!!filters.onlyUnassigned}
              onChange={(_, v) =>
                setFilters((f) => ({
                  ...f,
                  onlyUnassigned: v,
                  identreprise: null,
                }))
              }
            />
          }
          label="Sans entreprise"
        />

        <ToggleButtonGroup
          size="small"
          value={archiveTab}
          exclusive
          onChange={(_, v: ArchiveTab | null) => v && setArchiveTab(v)}
        >
          <ToggleButton value="all">Tous</ToggleButton>
          <ToggleButton value="active">Actifs</ToggleButton>
          <ToggleButton value="archived">Archivés</ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>

      {/* Tableau */}
      <TableContainer component={Paper} sx={{ mt: 1, maxHeight: 680 }}>
        <Table stickyHeader size="small" aria-label="Tous les appels">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "filename" ? order : false}>
                <TableSortLabel
                  active={orderBy === "filename"}
                  direction={orderBy === "filename" ? order : "asc"}
                  onClick={() => handleSort("filename")}
                >
                  filename
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "identreprise" ? order : false}
                align="center"
                sx={{ whiteSpace: "nowrap" }}
              >
                <TableSortLabel
                  active={orderBy === "identreprise"}
                  direction={orderBy === "identreprise" ? order : "asc"}
                  onClick={() => handleSort("identreprise")}
                >
                  identreprise
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "activity_count" ? order : false}
                align="right"
              >
                <TableSortLabel
                  active={orderBy === "activity_count"}
                  direction={orderBy === "activity_count" ? order : "asc"}
                  onClick={() => handleSort("activity_count")}
                >
                  activity_count
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "tag_count" ? order : false}
                align="right"
              >
                <TableSortLabel
                  active={orderBy === "tag_count"}
                  direction={orderBy === "tag_count" ? order : "asc"}
                  onClick={() => handleSort("tag_count")}
                >
                  tag_count
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "postit_count" ? order : false}
                align="right"
              >
                <TableSortLabel
                  active={orderBy === "postit_count"}
                  direction={orderBy === "postit_count" ? order : "asc"}
                  onClick={() => handleSort("postit_count")}
                >
                  postit_count
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "has_transcript" ? order : false}
                align="center"
                sx={{ whiteSpace: "nowrap" }}
              >
                <TableSortLabel
                  active={orderBy === "has_transcript"}
                  direction={orderBy === "has_transcript" ? order : "asc"}
                  onClick={() => handleSort("has_transcript")}
                >
                  has_transcript
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "duree" ? order : false}
                align="right"
              >
                <TableSortLabel
                  active={orderBy === "duree"}
                  direction={orderBy === "duree" ? order : "asc"}
                  onClick={() => handleSort("duree")}
                >
                  duree (sec)
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "archived" ? order : false}
                align="center"
              >
                <TableSortLabel
                  active={orderBy === "archived"}
                  direction={orderBy === "archived" ? order : "asc"}
                  onClick={() => handleSort("archived")}
                >
                  archived
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={orderBy === "status" ? order : false}
                align="left"
              >
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleSort("status")}
                >
                  status
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">actions</TableCell>
            </TableRow>

            {/* Ligne de filtres */}
            <TableRow>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="rechercher…"
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  fullWidth
                />
              </TableCell>

              <TableCell align="center">
                {/* identreprise déjà filtré via Select au-dessus → affiche en lecture seule */}
                <Typography variant="body2" color="text.secondary">
                  {filters.onlyUnassigned
                    ? "sans entreprise"
                    : (filters.identreprise ?? "toutes")}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <TextField
                  size="small"
                  placeholder="≥"
                  value={qMinActs}
                  onChange={(e) =>
                    setQMinActs(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "right" },
                  }}
                />
              </TableCell>

              <TableCell align="right">
                <TextField
                  size="small"
                  placeholder="≥"
                  value={qMinTags}
                  onChange={(e) =>
                    setQMinTags(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "right" },
                  }}
                />
              </TableCell>

              <TableCell align="right">
                <TextField
                  size="small"
                  placeholder="≥"
                  value={qMinPostits}
                  onChange={(e) =>
                    setQMinPostits(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "right" },
                  }}
                />
              </TableCell>

              <TableCell align="center">
                <Select
                  size="small"
                  value={qTranscript}
                  onChange={(e) => setQTranscript(e.target.value as TriBool)}
                >
                  <MenuItem value="all">tous</MenuItem>
                  <MenuItem value="yes">oui</MenuItem>
                  <MenuItem value="no">non</MenuItem>
                </Select>
              </TableCell>

              <TableCell align="right">
                <TextField
                  size="small"
                  placeholder="≥ sec"
                  value={qDurMin}
                  onChange={(e) =>
                    setQDurMin(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "right" },
                  }}
                />
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" color="text.secondary">
                  {archiveTab}
                </Typography>
              </TableCell>

              <TableCell align="left">
                <TextField
                  size="small"
                  placeholder="status…"
                  value={qStatus}
                  onChange={(e) => setQStatus(e.target.value)}
                  fullWidth
                />
              </TableCell>

              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Typography>Chargement…</Typography>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Typography>Aucun appel.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((call: any) => (
                <TableRow key={`call-${call.callid}`} hover>
                  <TableCell sx={{ maxWidth: 380 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography noWrap title={call.filename}>
                        {call.filename}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    {call.identreprise ?? "—"}
                  </TableCell>

                  <TableCell align="right">
                    {call.activity_count ?? 0}
                  </TableCell>
                  <TableCell align="right">{call.tag_count ?? 0}</TableCell>
                  <TableCell align="right">{call.postit_count ?? 0}</TableCell>

                  <TableCell align="center">
                    {call.has_transcript ? "✓" : "—"}
                  </TableCell>

                  <TableCell align="right">
                    {fmtDuration(call.duree ?? call.duration_sec)}
                  </TableCell>

                  <TableCell align="center">
                    {call.archived ? "oui" : "non"}
                  </TableCell>

                  <TableCell align="left">{call.status ?? "—"}</TableCell>

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Évaluer">
                      <IconButton size="small" onClick={() => selectCall(call)}>
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archiver">
                      <IconButton
                        size="small"
                        onClick={() => archiveCall(call.callid)}
                      >
                        <ArchiveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteCall(call.callid)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
        {filtered.length} appels affichés
      </Typography>
    </Box>
  );
}
