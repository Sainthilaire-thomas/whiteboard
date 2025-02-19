"use client";
import { useState } from "react";

export default function Transcript({
  transcript,
  addComment,
}: {
  transcript: string;
  addComment: (text: string) => void;
}) {
  const [text, setText] = useState(transcript);
  const [comment, setComment] = useState("");

  return (
    <div className="border p-4 bg-green-100 rounded-md mt-4">
      <h2 className="text-lg font-semibold">Transcription</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border"
      />

      <div className="mt-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-1 w-3/4"
        />
        <button
          onClick={() => {
            addComment(comment);
            setComment("");
          }}
          className="bg-blue-500 text-white px-4 py-1 ml-2"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
