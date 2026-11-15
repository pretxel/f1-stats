// OpenF1 uses FIA/IOC-style country codes; flag lookups need ISO 3166 alpha-3.
const FIA_TO_ISO: Record<string, string> = {
  UAE: "ARE",
  MON: "MCO",
  NED: "NLD",
  KSA: "SAU",
  BRN: "BHR",
  GER: "DEU",
  POR: "PRT",
  RSA: "ZAF",
  SUI: "CHE",
  MAS: "MYS",
};

export function countryIso3(code: string): string {
  return FIA_TO_ISO[code] ?? code;
}
