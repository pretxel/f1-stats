export const getDriver = async (driverNumber: string) => {
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "drivers";
  const QUERIES = `?driver_number=${driverNumber}`;
  try {
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES, {
      cache: "force-cache",
    });
    const racesData = await response.json();
    return racesData.at(0);
  } catch (error) {
    console.error(error);
  }
  return null;
};
