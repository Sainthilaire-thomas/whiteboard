// types.ts
export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder"; // ✅ Obligatoire
  mimeType?: string;
  size?: number;
  children?: FileNode[];
}
