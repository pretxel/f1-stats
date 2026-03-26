// Import jest under an alias so the global `jest` remains accessible
// inside jest.mock() factories (which @swc/jest hoists before imports run).
import { jest as jestGlobals } from "@jest/globals";
import { getPitstops } from "./pitstops";
import { getDriver } from "./driver";

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      // Always grant a rate-limit slot so tests don't block on Redis.
      eval: jest.fn().mockResolvedValue(1),
    }),
  },
}));

jest.mock("./driver", () => ({
  getDriver: jest.fn(),
}));

describe("getPitstops", () => {
  let fetchSpy: jestGlobals.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jestGlobals.spyOn(global, "fetch");
    (getDriver as jestGlobals.Mock).mockResolvedValue({ code: "DRV" });
  });

  afterEach(() => {
    jestGlobals.restoreAllMocks();
  });

  it("returns parsed pit stop entries", async () => {
    process.env.API_ENDPOINT = "https://api.test/";

    const sampleResponse = [
      { driver_number: 44, lap: 10 },
      { driver_number: 55, lap: 15 },
    ];

    fetchSpy.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(sampleResponse),
    } as unknown as Response);

    const data = await getPitstops("9507");

    expect(data).toEqual([
      { driver_number: 44, lap: 10, driver: { code: "DRV" } },
      { driver_number: 55, lap: 15, driver: { code: "DRV" } },
    ]);

    expect(Array.isArray(data)).toBe(true);
  });
});
