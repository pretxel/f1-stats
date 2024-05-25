import { getDriver } from "./driver";

export const getPitstops = async (sessionKey: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "pit";
  const QUERIES = `?session_key=${sessionKey}`;
  let raceControlData = [];
  try {
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);
    raceControlData = await response.json();
  } catch (error) {
    console.error(error);
  }

  for (let i = 0; i < raceControlData.length; i++) {
    const driver = await getDriver(raceControlData[i].driver_number);
    raceControlData[i] = { ...raceControlData[i], driver };
  }

  return raceControlData;
};
