import { jest } from "@jest/globals";
import { getPitstops } from "./pitstops";
import { getDriver } from "./driver";

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock("./driver", () => ({
  getDriver: jest.fn(),
}));

describe("getPitstops", () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns parsed pit stop entries", async () => {
    process.env.API_ENDPOINT = "https://api.test/";

    const sampleResponse = [
      { driver_number: 44, lap: 10 },
      { driver_number: 55, lap: 15 },
    ];

    fetchSpy.mockResolvedValue({
      json: jest.fn().mockResolvedValue(sampleResponse),
    } as unknown as Response);

    (getDriver as jest.Mock).mockResolvedValue({ code: "DRV" });

    const data = await getPitstops("9507");

    expect(data).toEqual([
      { driver_number: 44, lap: 10, driver: { code: "DRV" } },
      { driver_number: 55, lap: 15, driver: { code: "DRV" } },
    ]);

    expect(Array.isArray(data)).toBe(true);
  });
});
