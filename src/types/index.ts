export type Wedding = {
  id: string;
  partnerNames: string;
  weddingDate: string | null;
  venue: string | null;
  guestCountEst: number | null;
  budgetTotal: string | null;
  stylePrefs: unknown;
  _count?: { guests: number; vendors: number; moodBoardItems: number; documents: number };
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type MoodBoardItem = {
  id: string;
  type: "image" | "link";
  url: string;
  sourceSite: string | null;
  title: string | null;
  tags: string[];
  notes: string | null;
};

export type Guest = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  group: string | null;
  rsvpStatus: "pending" | "yes" | "no";
  plusOne: boolean;
  mealChoice: string | null;
  notes: string | null;
};

export type Vendor = {
  id: string;
  category: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  status: "researching" | "contacted" | "booked" | "paid";
  cost: string | null;
  contractUrl: string | null;
  notes: string | null;
};

export type BudgetItem = {
  id: string;
  category: string;
  description: string | null;
  estimatedCost: string;
  actualCost: string | null;
  paid: boolean;
  dueDate: string | null;
  vendor?: { name: string } | null;
};

export type WeddingDocument = {
  id: string;
  type: string;
  title: string;
  format: string;
  fileUrl: string | null;
  createdAt: string;
};
