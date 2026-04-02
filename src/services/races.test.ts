import { getRaces } from "@/services/races";
import { currentYear } from "@/utils/constants";
import { Redis } from "@upstash/redis";

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      eval: jest.fn().mockResolvedValue(1),
    }),
  },
}));

const mockRaces = [
  {
    session_key: "9507",
    location: "Bahrain",
    session_name: "Race",
    session_type: "Race",
    date_start: "2024-03-02T15:00:00+00:00",
    date_end: "2024-03-02T17:00:00+00:00",
    country_name: "Bahrain",
    country_code: "BH",
    circuit_short_name: "Bahrain",
  },
];

function getRedisMock() {
  return Redis.fromEnv() as {
    get: jest.Mock;
    set: jest.Mock;
    eval: jest.Mock;
  };
}

describe("getRaces", () => {
  beforeEach(() => {
    process.env.API_ENDPOINT = "https://api.example.com/";
    jest.clearAllMocks();
    // Rate limiter: acquireSlot always grants immediately
    getRedisMock().eval.mockResolvedValue(1);
    // Default: cache miss
    getRedisMock().get.mockResolvedValue(null);
    getRedisMock().set.mockResolvedValue(undefined);
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockRaces,
      headers: { get: () => null },
    } as unknown as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("default year behavior", () => {
    it("uses currentYear in the cache key when no params are passed", async () => {
      await getRaces({});

      const expectedKey = `racesResponse_year_${currentYear}`;
      expect(getRedisMock().get).toHaveBeenCalledWith(expectedKey);
    });

    it("uses currentYear in the API URL when no params are passed", async () => {
      await getRaces({});

      const expectedUrl = `https://api.example.com/sessions?year=${currentYear}`;
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, undefined);
    });

    it("returns data from the API response", async () => {
      const result = await getRaces({});

      expect(result).toEqual(mockRaces);
    });
  });

  describe("cache hit", () => {
    it("returns cached data without calling fetch when cache key and query match", async () => {
      const expectedUrl = `https://api.example.com/sessions?year=${currentYear}`;
      const cachedPayload = JSON.stringify({
        query: expectedUrl,
        data: mockRaces,
      });
      getRedisMock().get.mockResolvedValue(cachedPayload);

      const result = await getRaces({});

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockRaces);
    });

    it("does not write to Redis when returning from cache", async () => {
      const expectedUrl = `https://api.example.com/sessions?year=${currentYear}`;
      const cachedPayload = JSON.stringify({
        query: expectedUrl,
        data: mockRaces,
      });
      getRedisMock().get.mockResolvedValue(cachedPayload);

      await getRaces({});

      expect(getRedisMock().set).not.toHaveBeenCalled();
    });

    it("falls through to fetch when cached query URL does not match current URL", async () => {
      // Cache has a stale entry pointing to a different URL
      const stalePayload = JSON.stringify({
        query: "https://api.example.com/sessions?year=2020",
        data: [],
      });
      getRedisMock().get.mockResolvedValue(stalePayload);

      await getRaces({});

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe("cache miss", () => {
    it("calls fetch when Redis returns null", async () => {
      getRedisMock().get.mockResolvedValue(null);

      await getRaces({});

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("stores fetched data in Redis after a cache miss", async () => {
      getRedisMock().get.mockResolvedValue(null);

      await getRaces({});

      expect(getRedisMock().set).toHaveBeenCalledTimes(1);
      const [cacheKey, storedValue] = getRedisMock().set.mock.calls[0];
      expect(cacheKey).toBe(`racesResponse_year_${currentYear}`);
      const parsed = JSON.parse(storedValue);
      expect(parsed.data).toEqual(mockRaces);
      expect(parsed.query).toBe(
        `https://api.example.com/sessions?year=${currentYear}`
      );
    });

    it("stores result in Redis with TTL option set", async () => {
      await getRaces({});

      const [, , options] = getRedisMock().set.mock.calls[0];
      expect(options).toHaveProperty("ex");
      expect(typeof options.ex).toBe("number");
      expect(options.ex).toBeGreaterThan(0);
    });
  });

  describe("API error handling", () => {
    it("throws an error when response.ok is false", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
        headers: { get: () => null },
      } as unknown as Response);

      await expect(getRaces({})).rejects.toThrow("API Error: 500");
    });

    it("throws an error including the status code when response.ok is false", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not Found",
        headers: { get: () => null },
      } as unknown as Response);

      await expect(getRaces({})).rejects.toThrow("404");
    });

    it("re-throws errors from fetch", async () => {
      jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

      await expect(getRaces({})).rejects.toThrow("Network error");
    });
  });

  describe("sessionType param", () => {
    it("appends sessionType to the query string", async () => {
      await getRaces({ sessionType: "Race" });

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("session_type=Race");
    });

    it("uses a sessionType-specific cache key", async () => {
      await getRaces({ sessionType: "Qualifying" });

      expect(getRedisMock().get).toHaveBeenCalledWith(
        "racesResponse_session_type_Qualifying"
      );
    });

    it("still includes the year param in the URL when sessionType is set", async () => {
      await getRaces({ sessionType: "Sprint" });

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain(`year=${currentYear}`);
    });

    it("returns data from the API when sessionType is provided", async () => {
      const result = await getRaces({ sessionType: "Race" });

      expect(result).toEqual(mockRaces);
    });
  });

  describe("sessionKey param", () => {
    it("appends session_key to the query string", async () => {
      await getRaces({ sessionKey: "9507" });

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain("session_key=9507");
    });

    it("uses a sessionKey-specific cache key", async () => {
      await getRaces({ sessionKey: "9507" });

      expect(getRedisMock().get).toHaveBeenCalledWith(
        "racesResponse_session_key_9507"
      );
    });
  });
});
