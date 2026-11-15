export type RaceItemType = {
  session_key: string;
  meeting_key?: string | number;
  date_start: Date;
  date_end: Date;
  gmt_offset?: string;
  location: string;
  country_name: string;
  country_code: string;
  circuit_short_name: string;
  session_name: string;
  session_type: string;
  year?: number;
};
