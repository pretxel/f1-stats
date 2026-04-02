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
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2 flex-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-f1red opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-f1red" />
      </span>
      <span className="font-data text-[10px] font-bold tracking-[0.25em] uppercase text-f1red">
        LIVE
      </span>
    </div>
  );
}
