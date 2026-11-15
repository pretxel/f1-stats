import { countryIso3 } from "../countryIso3";

describe("countryIso3", () => {
  it.each([
    ["UAE", "ARE"],
    ["MON", "MCO"],
    ["NED", "NLD"],
    ["KSA", "SAU"],
    ["BRN", "BHR"],
    ["GBR", "GBR"],
    ["BRA", "BRA"],
  ])("%s → %s", (code, iso) => {
    expect(countryIso3(code)).toBe(iso);
  });
});
