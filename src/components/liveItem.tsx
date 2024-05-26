"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
interface LiveItemProps {
  isLiveFetching?: boolean;
}

const FETCH_INTERVAL = 5000;

export default function LiveItem({ isLiveFetching }: LiveItemProps) {
  const router = useRouter();
  const apiCall = async (router: AppRouterInstance) => {
    console.log("FETCH LIVE DATA CLIENT-- " + new Date().getTime());
    router.refresh();
  };

  useEffect(() => {
    if (isLiveFetching) {
      const id = setInterval(() => apiCall(router), FETCH_INTERVAL);
      return () => clearInterval(id);
    }
  }, [router, isLiveFetching]);
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
