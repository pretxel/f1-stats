import { add } from './big';

const adaptPitstops = (pitstops: any[]) => {
  const grouped = new Map<number, any>();
  pitstops.forEach((pitstop: any) => {
    const driverId = pitstop.driver_number;
    if (!grouped.has(driverId)) {
      grouped.set(driverId, {
        key: `${driverId}`,
        name: pitstop.driver.full_name,
        imageUrl: pitstop.driver.headshot_url,
        pitstops: 0,
        total_duration: 0,
      });
    }
    const data = grouped.get(driverId);
    data.pitstops += 1;
    data.total_duration = add(data.total_duration, pitstop.pit_duration);
    grouped.set(driverId, data);
  });
  return Array.from(grouped.values());
};

export default adaptPitstops;
