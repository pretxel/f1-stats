import { describe, it } from "node:test";
import { getPitstops } from "./pitstops";

describe("pitstop", () => {
  it("should get pitstops", async () => {
    process.env.API_ENDPOINT = "https://api.openf1.org/v1/";
    const pitstops = await getPitstops("9507");
  });
});
