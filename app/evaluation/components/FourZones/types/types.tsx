// types.ts
export interface PostitType {
  id: string;
  content: string;
  zone: string;
  color: string;
  isOriginal: boolean;
}

export interface SortablePostitProps {
  postit: PostitType;
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOriginal?: boolean;
}

export interface DroppableZoneProps {
  id: string;
  title: string;
  backgroundColor: string;
  postits: PostitType[];
  fontSize: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddClick: (zone: string, content: string) => void;
  isEntrepriseZone?: boolean;
}

export interface ClientResponseSectionProps {
  selectionMode: string;
  onSelectionModeChange: (value: string) => void;
  selectedClientText: string;
  selectedConseillerText: string;
  fontSize: number;
  zoneColors: Record<string, string>;
  hasOriginalPostits: boolean;
  onCategorizeClick: (text: string) => void;
  setSelectedClientText: (text: string) => void;
  setSelectedConseillerText: (text: string) => void;
}

export interface SuggestionSectionProps {
  selectedClientText: string;
  newPostitContent: string;
  onNewPostitContentChange: (value: string) => void;
  currentZone: string;
  onCurrentZoneChange: (value: string) => void;
  onAddPostit: () => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}

export interface EditDialogProps {
  open: boolean;
  content: string;
  onContentChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export interface CategoryDialogProps {
  open: boolean;
  text: string;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export interface ExtendedRolePlayData {
  callId: string;
  postits: PostitType[];
  clientText?: string;
  conseillerText?: string;
  date: string;
}

export interface CallDataContextType {
  selectedCall: { callid: string } | null;
  selectedPostitForRolePlay: {
    id: string;
    text?: string;
    pratique?: string;
  } | null;
  rolePlayData: ExtendedRolePlayData | null;
  saveRolePlayData: (data: ExtendedRolePlayData, id: string) => Promise<void>;
  fetchRolePlayData: () => Promise<void>;
  zoneTexts: any;
  selectTextForZone: any;
  isLoadingRolePlay: boolean;
}

// Dans le fichier où ImprovementSection est défini
interface ImprovementSectionProps {
  selectedClientText: string;
  newPostitContent: string; // Ajoutez cette propriété
  onNewPostitContentChange: React.Dispatch<React.SetStateAction<string>>;
  currentZone: string;
  onCurrentZoneChange: React.Dispatch<React.SetStateAction<string>>;
  onAddPostit: () => void;
  fontSize: number;
  zoneColors: Record<string, string>;
}
