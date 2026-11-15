import Link from "next/link";
import { classNames } from "@/utils/classNames";

export type SegmentedItem = {
  label: string;
  href: string;
  active: boolean;
};

type SegmentedLinksProps = {
  label: string;
  items: SegmentedItem[];
  /** Show the label visibly above the control (filters) or keep it for screen readers only (tabs). */
  showLabel?: boolean;
};

export default function SegmentedLinks({ label, items, showLabel = true }: SegmentedLinksProps) {
  return (
    <nav aria-label={label} className="min-w-0">
      {showLabel && <p className="mb-2 text-label text-ink-soft">{label}</p>}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="inline-flex rounded-[3px] border border-ink">
          {items.map((item, i) => (
            <li key={item.href} className={i > 0 ? "border-l border-ink" : ""}>
              <Link
                href={item.href}
                scroll={false}
                aria-current={item.active ? "page" : undefined}
                className={classNames(
                  "block whitespace-nowrap px-2.5 py-2 text-[0.9375rem] sm:px-3.5 font-medium leading-5 transition-colors",
                  item.active ? "bg-ink text-slab" : "text-ink hover:bg-slab"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
