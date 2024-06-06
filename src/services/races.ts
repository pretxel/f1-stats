interface getRaceType {
  sessionKey?: string;
  sessionType?: string;
}

export const getRaces = async (params: getRaceType) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "sessions";
  let QUERIES = "?year=2024";
  if (params.sessionKey) {
    QUERIES += "&session_key=" + params.sessionKey;
  }
  if (params.sessionType) {
    QUERIES += "&session_type=" + params.sessionType;
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
