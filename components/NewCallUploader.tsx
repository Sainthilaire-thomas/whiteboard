"use client";
import { useState } from "react";

export default function NewCallUploader({
  onUpload,
}: {
  onUpload: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      onUpload(); // ✅ Simule l'affichage de la transcription
    }
  };

  return (
    <div className="border p-4 bg-blue-100 rounded-md">
      <h2 className="text-lg font-semibold">Uploader un appel</h2>
      <input type="file" onChange={handleUpload} />
      {file && <p>📁 {file.name}</p>}
    </div>
  );
}
