export default function SearchInput() {
  return (
    <div className="relative w-full max-w-xl mb-6">
      <input
        placeholder="Search races..."
        className="w-full h-11 bg-carbon-light border border-carbon-border text-chromium font-data text-xs tracking-wide pl-4 pr-28 outline-none placeholder:text-muted focus:border-f1red transition-colors duration-200"
        type="text"
        name="query"
        id="query"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-11 px-5 font-data text-[10px] font-bold tracking-[0.25em] uppercase text-white bg-f1red hover:bg-f1red-dark transition-colors duration-200 flex items-center gap-2"
      >
        <svg
          className="w-3.5 h-3.5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search
      </button>
    </div>
  );
}
