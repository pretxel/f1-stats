import { sentenceCase } from "../sentenceCase";

describe("sentenceCase", () => {
  it.each([
    ["SAFETY CAR DEPLOYED", "Safety car deployed"],
    ["DRS ENABLED", "DRS enabled"],
    ["VIRTUAL SAFETY CAR ENDING", "Virtual safety car ending"],
    ["WAVED BLUE FLAG FOR CAR 24 (ZHO) TIMED AT 13:32:27", "Waved blue flag for car 24 (ZHO) timed at 13:32:27"],
    ["CAR 1 (VER) TIME 1:12.345 DELETED - TRACK LIMITS AT TURN 4 LAP 12 15:01:02", "Car 1 (VER) time 1:12.345 deleted - track limits at turn 4 lap 12 15:01:02"],
    ["FIA STEWARDS: NO FURTHER INVESTIGATION", "FIA stewards: no further investigation"],
    ["Already mixed case", "Already mixed case"],
    ["", ""],
  ])("%s", (input, expected) => {
    expect(sentenceCase(input)).toBe(expected);
  });
});
