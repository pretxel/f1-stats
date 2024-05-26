export const getRaces = async (sessionKey?: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "sessions";
  let QUERIES = "?year=2024";
  if (sessionKey) {
    QUERIES += "&session_key=" + sessionKey;
  }
  try {
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);
    const racesData = await response.json();
    return racesData;
  } catch (error) {
    console.error("Error: ", error);
  }
  return [];
};
