import { getPitstops } from "./pitstops";

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      eval: jest.fn().mockResolvedValue(1),
    }),
  },
}));

jest.mock("./driver", () => ({
  getDriver: jest.fn().mockResolvedValue({ code: "DRV" }),
}));

jest.mock("./isSessionLive", () => ({
  isSessionLive: jest.fn().mockResolvedValue(false),
}));

describe("getPitstops", () => {
  beforeEach(() => {
    process.env.API_ENDPOINT = "https://api.test/";
    jest.clearAllMocks();
  });

  it("returns parsed pit stop entries with driver data attached", async () => {
    const sampleResponse = [
      { driver_number: 44, lap: 10 },
      { driver_number: 55, lap: 15 },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(sampleResponse),
    } as unknown as Response);

    const { getDriver } = require("./driver");
    getDriver.mockResolvedValue({ code: "DRV" });

    const data = await getPitstops("9507");

    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([
      { driver_number: 44, lap: 10, driver: { code: "DRV" } },
      { driver_number: 55, lap: 15, driver: { code: "DRV" } },
    ]);
  });
});
