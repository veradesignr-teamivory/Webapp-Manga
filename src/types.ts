export type UserRole = "admin" | "user";

export type UserAccount = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export type SanitizedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type SessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type AssetCategory =
  | "poses"
  | "backgrounds"
  | "energy-beams"
  | "explosions"
  | "effects"
  | "speech-bubbles"
  | "sprites"
  | "sketches";

export type AssetRecord = {
  id: string;
  name: string;
  category: AssetCategory;
  tags: string[];
  src: string;
  uploadedBy: string;
  createdAt: string;
};

export type AppData = {
  users: UserAccount[];
  sessions: SessionRecord[];
  assets: AssetRecord[];
};

export type EditorPlacedAsset = {
  id: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
};
