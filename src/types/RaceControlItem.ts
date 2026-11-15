export type RaceControlTypeItem = {
  session_key: string;
  meeting_key: string;
  date: Date;
  category: string;
  message: string;
  flag?: string | null;
  scope?: string | null;
  sector?: number | null;
  lap_number?: number | null;
  driver_number?: number | null;
};
