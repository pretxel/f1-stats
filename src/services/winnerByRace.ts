import { getDriver } from "./driver";
export const getWinnerByRace = async (sessionKey: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "position";
  const QUERIES = `?session_key=${sessionKey}&position<=1`;
  const response = await fetch(API_ENDPOINT + SERVICE + QUERIES, {
    cache: "force-cache",
  });
  const racesData = await response.json();
  const winnerDriver = racesData.at(-1);

  if (!winnerDriver) {
    throw new Error("No winner found");
  }

  const driver = await getDriver(winnerDriver.driver_number);

  return {
    ...winnerDriver,
    driver,
  };
};
