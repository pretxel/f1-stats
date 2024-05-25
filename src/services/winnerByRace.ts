import { getDriver } from "./driver";
export const getWinnerByRace = async (sessionKey: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "position";
  const QUERIES = `?session_key=${sessionKey}&position<=1`;
  let racesData = [];
  try {
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES, {
      cache: "force-cache",
    });
    racesData = await response.json();
  } catch (error) {
    console.error(error);
  }

  const winnerDriver = racesData.at(-1);

  let driver = null;
  if (winnerDriver) {
    driver = await getDriver(winnerDriver.driver_number);
  }

  return {
    ...winnerDriver,
    driver,
  };
};
