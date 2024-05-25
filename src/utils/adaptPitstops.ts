const adaptPitstops = (pitstops: any[]) => {
  return pitstops.map((pitstop: any) => {
    return {
      key: `${pitstop.driver_number}-${pitstop.lap_number}`,
      name: pitstop.driver.full_name,
      imageUrl: pitstop.driver.headshot_url,
      lap_number: pitstop.lap_number,
      pit_duration: pitstop.pit_duration,
    };
  });
};

export default adaptPitstops;
