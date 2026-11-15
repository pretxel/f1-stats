export default function Loading() {
  return (
    <div role="status" className="animate-pulse motion-reduce:animate-none">
      <span className="sr-only">Loading session</span>
      <div className="mb-6 h-5 w-28 bg-slab" />
      <div className="h-5 w-48 bg-slab" />
      <div className="mt-4 h-11 w-2/3 max-w-md bg-slab" />
      <div className="mt-4 h-5 w-64 bg-slab" />
      <div className="mt-10 h-9 w-full border border-rule bg-slab" />
      <div className="mt-12 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-11 bg-slab" />
        ))}
      </div>
    </div>
  );
}
