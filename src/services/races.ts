export const getRaces = async () => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "sessions";
  const QUERIES = "?year=2024";
  const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);
  const racesData = await response.json();
  return racesData;
};
