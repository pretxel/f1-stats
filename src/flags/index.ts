import { unstable_flag as flag } from "@vercel/flags/next";
import { get } from "@vercel/edge-config";

export const showSummerSale = flag({
  key: "summer-sale",
  async decide() {
    const value = await get(this.key); // this.key refers to "summer-sale"
    return value ?? false;
  },
});
