"use client";

import Script from "next/script";

interface UmamiScriptProps {
  websiteId: string;
}

export default function UmamiScript({ websiteId }: UmamiScriptProps) {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL || "https://analytics.masamune.fr";

  return (
    <Script
      async
      defer
      data-website-id={websiteId}
      src={`${umamiUrl}/script.js`}
      strategy="afterInteractive"
    />
  );
}
