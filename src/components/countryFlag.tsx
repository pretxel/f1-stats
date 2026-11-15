import Image from "next/image";
import { findFlagUrlByIso3Code } from "country-flags-svg";
import { countryIso3 } from "@/utils/countryIso3";

export default function CountryFlag({ code, size = "md" }: { code: string; size?: "sm" | "md" }) {
  const url = findFlagUrlByIso3Code(countryIso3(code));
  const [w, h] = size === "md" ? [30, 20] : [21, 14];
  if (!url) {
    return <span aria-hidden="true" className="flex-none bg-slab ring-1 ring-rule" style={{ width: w, height: h }} />;
  }
  return (
    <Image
      src={url}
      alt=""
      width={w}
      height={h}
      className="flex-none object-cover ring-1 ring-rule"
      style={{ width: w, height: h }}
    />
  );
}
