export const getRaceControlBySession = async (sessionKey: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "race_control";
  const QUERIES = `?session_key=${sessionKey}`;
  try {
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES, {
      cache: "force-cache",
    });
    const raceControlData = await response.json();
    return raceControlData;
  } catch (error) {
    console.error(error);
  }
  return [];
};
