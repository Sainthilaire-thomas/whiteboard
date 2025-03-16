"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabaseClient } from "@lib/supabaseClient";
import QuestionCoach from "../Sondage/QuestionCoach";
import { v4 as uuidv4 } from "uuid";

type PostItType = {
  id: string;
  content: string;
  x: number;
  y: number;
};

export default function PostIt() {
  const [postIts, setPostIts] = useState<PostItType[]>([]);
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    const fetchPostIts = async () => {
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("postits")
        .select("*");

      if (error) {
        console.error("❌ Erreur de récupération :", error);
      } else if (data) {
        setPostIts(data as PostItType[]);
      }
    };

    fetchPostIts();

    const channel = supabaseClient
      .channel("postits_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "whiteboard", table: "postits" },
        (payload) => {
          const { eventType, new: newPostIt, old: oldPostIt } = payload;

          if (eventType === "INSERT" && newPostIt) {
            setPostIts((prev) => [...prev, newPostIt as PostItType]);
          } else if (eventType === "UPDATE" && newPostIt) {
            setPostIts((prev) =>
              prev.map((postIt) =>
                postIt.id === newPostIt.id ? (newPostIt as PostItType) : postIt
              )
            );
          } else if (eventType === "DELETE" && oldPostIt) {
            setPostIts((prev) =>
              prev.filter((postIt) => postIt.id !== oldPostIt.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const addPostIt = async () => {
    if (!newContent.trim()) return;

    const newPostIt: PostItType = {
      id: uuidv4(),
      content: newContent,
      x: 100,
      y: 100,
    };

    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("postits")
      .insert(newPostIt);

    if (error) console.error("❌ Erreur d'insertion :", error);
    setNewContent("");
  };

  const deletePostIt = async (id: string) => {
    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("postits")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Erreur de suppression :", error);
    } else {
      setPostIts((prev) => prev.filter((postIt) => postIt.id !== id)); // ✅ Suppression locale immédiate
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    setPostIts((prev) =>
      prev.map((postIt) =>
        postIt.id === active.id
          ? { ...postIt, x: postIt.x + delta.x, y: postIt.y + delta.y }
          : postIt
      )
    );

    const movedPostIt = postIts.find((postIt) => postIt.id === active.id);
    if (movedPostIt) {
      const updatedX = movedPostIt.x + delta.x;
      const updatedY = movedPostIt.y + delta.y;

      const { error } = await supabaseClient
        .schema("whiteboard")
        .from("postits")
        .update({ x: updatedX, y: updatedY })
        .eq("id", movedPostIt.id);

      if (error) console.error("❌ Erreur de déplacement :", error);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "80vh", position: "relative", p: 2 }}>
      {/* 📝 Question visible par tous, éditable par le coach */}
      <QuestionCoach />
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          label="Nouveau post-it"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <Button variant="contained" onClick={addPostIt}>
          Ajouter
        </Button>
      </Box>

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        {postIts.map((postIt) => (
          <DraggablePostIt
            key={postIt.id}
            postIt={postIt}
            onDelete={() => deletePostIt(postIt.id)}
          />
        ))}
      </DndContext>
    </Box>
  );
}

function DraggablePostIt({
  postIt,
  onDelete,
}: {
  postIt: PostItType;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: postIt.id,
    });

  const style = {
    transform: `translate3d(${postIt.x + (transform?.x ?? 0)}px, ${
      postIt.y + (transform?.y ?? 0)
    }px, 0)`,
    position: "absolute" as const,
    width: 200,
    p: 2,
    bgcolor: "orange",
    color: "black",
    fontWeight: "bold",
    borderRadius: 2,
    boxShadow: 3,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
  };

  return (
    <Paper ref={setNodeRef} sx={style} {...attributes}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* ✅ Zone de drag dédiée */}
        <Box
          {...listeners}
          sx={{
            cursor: "grab",
            mr: 1,
            color: "black",
          }}
        >
          ☰
        </Box>

        {/* ✅ Contenu du post-it */}
        <Typography
          variant="body1"
          sx={{ flexGrow: 1, wordWrap: "break-word" }}
        >
          {postIt.content}
        </Typography>

        {/* 🗑️ Bouton suppression (hors zone de drag) */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // 🔒 Stoppe la propagation vers le drag
            console.log("🗑️ Suppression du post-it :", postIt.id); // ✅ Vérifie le clic
            onDelete();
          }}
          sx={{ ml: 1, color: "black" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
