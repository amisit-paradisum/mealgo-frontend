"use client";

import { RecoilRoot } from "recoil";
import RecoilNexus from "recoil-nexus";
import { GoogleAuthWrapper } from "@/components/GoogleAuthWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <RecoilNexus />
      <GoogleAuthWrapper>
        {children}
      </GoogleAuthWrapper>
    </RecoilRoot>
  );
}
