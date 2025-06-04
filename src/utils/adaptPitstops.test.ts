import adaptPitstops from './adaptPitstops';

describe('adaptPitstops', () => {
  it('groups pitstops by driver and sums durations', () => {
    const data = [
      {
        driver_number: 44,
        lap_number: 10,
        pit_duration: '2.5',
        driver: { full_name: 'Driver A', headshot_url: '/a.png' },
      },
      {
        driver_number: 44,
        lap_number: 20,
        pit_duration: '3',
        driver: { full_name: 'Driver A', headshot_url: '/a.png' },
      },
      {
        driver_number: 55,
        lap_number: 15,
        pit_duration: '4',
        driver: { full_name: 'Driver B', headshot_url: '/b.png' },
      },
    ];

    const result = adaptPitstops(data);

    expect(result).toEqual([
      {
        key: '44',
        name: 'Driver A',
        imageUrl: '/a.png',
        pitstops: 2,
        total_duration: 5.5,
      },
      {
        key: '55',
        name: 'Driver B',
        imageUrl: '/b.png',
        pitstops: 1,
        total_duration: 4,
      },
    ]);
  });
});
