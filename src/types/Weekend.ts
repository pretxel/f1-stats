import { RaceItemType } from "./RaceItemType";

export type Weekend = {
  key: string;
  location: string;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  gmt_offset?: string;
  start: Date;
  end: Date;
  sessions: RaceItemType[];
};
