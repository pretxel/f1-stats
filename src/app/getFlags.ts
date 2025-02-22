import { FlagOverridesType, decrypt } from "@vercel/flags";
import { cookies } from "next/headers";

export async function getFlags() {
  const cookiesData = await cookies();
  const overrideCookie = cookiesData.get("vercel-flag-overrides")?.value;
  const overrides = overrideCookie
    ? await decrypt<FlagOverridesType>(overrideCookie)
    : {};

  const flags = {
    showSearchInput: overrides?.showSearchInput ?? false,
  };

  return flags;
}
