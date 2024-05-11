import { getDriver } from "./driver";

export const getPitstops = async (sessionKey: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "pit";
  const QUERIES = `?session_key=${sessionKey}`;
  const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);
  const raceControlData = await response.json();

  for (let i = 0; i < raceControlData.length; i++) {
    const driver = await getDriver(raceControlData[i].driver_number);
    raceControlData[i] = { ...raceControlData[i], driver };
  }

  return raceControlData;
};
