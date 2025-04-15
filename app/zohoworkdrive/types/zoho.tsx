// types/zoho.ts

export interface ZohoAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number; // timestamp when the token expires
}

export interface ZohoFile {
  id: string;
  name: string;
  type: "file" | "folder";
  createdTime: string;
  modifiedTime: string;
  size?: number;
  mimeType?: string;
  parentId?: string;
  thumbnailUrl?: string;
}

export interface ZohoWorkdriveResponse {
  data: ZohoFile[];
  nextPageToken?: string;
}

export interface ZohoError {
  code: string;
  message: string;
  details?: any;
}
