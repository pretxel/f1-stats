import { isSessionLive } from "../isSessionLive";

jest.mock("../races", () => ({
  getRaces: jest.fn(),
}));

jest.mock("@/utils/isLiveSessionNow", () => jest.fn());

const { getRaces } = require("../races");
const isLiveSessionNow = require("@/utils/isLiveSessionNow");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("isSessionLive", () => {
  it("returns true when the session is currently live", async () => {
    getRaces.mockResolvedValue([
      {
        session_key: "9507",
        date_start: "2024-03-02T14:00:00",
        date_end: "2024-03-02T16:00:00",
      },
    ]);
    isLiveSessionNow.mockReturnValue(true);

    const result = await isSessionLive("9507");

    expect(result).toBe(true);
    expect(isLiveSessionNow).toHaveBeenCalledWith(
      new Date("2024-03-02T14:00:00"),
      new Date("2024-03-02T16:00:00")
    );
  });

  it("returns false when the session has ended", async () => {
    getRaces.mockResolvedValue([
      {
        session_key: "9507",
        date_start: "2024-03-02T14:00:00",
        date_end: "2024-03-02T16:00:00",
      },
    ]);
    isLiveSessionNow.mockReturnValue(false);

    const result = await isSessionLive("9507");

    expect(result).toBe(false);
  });

  it("returns false when getRaces returns an empty array", async () => {
    getRaces.mockResolvedValue([]);

    const result = await isSessionLive("9507");

    expect(result).toBe(false);
    expect(isLiveSessionNow).not.toHaveBeenCalled();
  });

  it("returns false when getRaces returns null/undefined", async () => {
    getRaces.mockResolvedValue(null);

    const result = await isSessionLive("9507");

    expect(result).toBe(false);
  });

  it("returns false when getRaces throws an error", async () => {
    getRaces.mockRejectedValue(new Error("API failure"));

    const result = await isSessionLive("9507");

    expect(result).toBe(false);
  });
});
