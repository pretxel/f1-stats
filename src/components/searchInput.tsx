export default function SearchInput() {
  return (
    <section className="relative w-full max-w-xl mx-auto bg-white rounded-full mb-4">
      <input
        placeholder="race"
        className="rounded-lg  border-stroke w-full h-14 bg-transparent py-2 pl-8 pr-32 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-indigo-200 focus:border-indigo-200"
        type="text"
        name="query"
        id="query"
      />
      <button
        type="submit"
        className="absolute inline-flex items-center h-8 px-4 py-2 text-sm text-white transition duration-150 ease-in-out rounded-full outline-none right-3 top-3 bg-indigo-400 sm:px-6 sm:text-base sm:font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      >
        <svg
          className="-ml-0.5 sm:-ml-1 mr-2 w-4 h-4 sm:h-5 sm:w-5"
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
          ></path>
        </svg>
        Search
      </button>
    </section>
  );
}
