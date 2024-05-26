export default async function LiveItem() {
  return (
    <div className="w-full flex justify-end">
      <span className="relative top-0 right-0 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
      </span>
      <span className="text-xs pl-2 text-black">Live</span>
    </div>
  );
}
