"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Script from "next/script";
import api from "../lib/api/api";
import { useSetRecoilState } from "recoil";
import { accessTokenState } from "@/recoil/auth";

interface LoginScreenProps {
  onNext: () => void;
}

interface GoogleAuthResponse {
  code: string;
}

interface GoogleCodeClient {
  requestCode: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: string;
            redirect_uri: string;
            callback: (response: GoogleAuthResponse) => void;
          }) => GoogleCodeClient;
        };
      };
    };
  }
}

export function LoginScreen({ onNext }: LoginScreenProps) {
  const codeClientRef = useRef<GoogleCodeClient | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setAccessToken = useSetRecoilState(accessTokenState);

  const initializeGoogleClient = () => {
    if (!window.google?.accounts?.oauth2) {
      console.error("❌ Google API 로드 실패");
      return;
    }

    const clientId =
      "825309889051-ct973jnbth44go6vuubolmh0vfg4hm61.apps.googleusercontent.com";

    try {
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        redirect_uri: "postmessage",
        callback: async (response: GoogleAuthResponse) => {
          if (!response.code) {
            console.error("❌ authorization code를 받지 못했습니다.");
            return;
          }

          setIsLoading(true);

          try {
            const res = await api.post(
              "/auth/signin",
              { oauth: response.code },
              { withCredentials: false }
            );

            // Recoil에 Access Token 저장yo
            setAccessToken(res.data.jwt);
            localStorage.setItem("refresh", res.data.refreshToken);
            console.log("🔐 Access Token 저장 완료:", res.data.jwt);
            console.log("refresh", res.data.refreshToken)

            setIsLoading(false);
            onNext();
          } catch (err: any) {
            console.error("❌ 로그인 요청 실패:", err);
            alert("로그인에 실패했습니다. 콘솔을 확인해주세요.");
          } finally {
            setIsLoading(false);
          }
        },
      });

      setIsGoogleLoaded(true);
    } catch (error: any) {
      console.error("❌ Google Client 초기화 실패:", error.message);
    }
  };

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      initializeGoogleClient();
    }
  }, [isGoogleLoaded]);

  const handleScriptLoad = () => {
    initializeGoogleClient();
  };

  const handleScriptError = () => {
    console.error("❌ Google Script 로드 실패");
  };

  const handleLogin = () => {
    if (!codeClientRef.current) {
      console.error("❌ Google Client가 초기화되지 않았습니다.");
      alert("Google 로그인을 준비 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (isLoading) return;

    try {
      codeClientRef.current.requestCode();
    } catch (error: any) {
      console.error("❌ requestCode 호출 실패:", error.message);
      alert("로그인 요청에 실패했습니다. 페이지를 새로고침 해주세요.");
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <div className="flex flex-col items-center justify-center h-screen px-[17px]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/logos/mealgo_logo.svg"
              className="h-20 m-auto"
              alt="mealgo logo"
            />
            <h1 className="text-3xl font-medium text-white">mealgo</h1>
            <p className="text-white text-[12px] font-medium">통합로그인</p>
          </div>
        </div>

        <div className="w-full pb-[33px]">
          <Button
            onClick={handleLogin}
            disabled={!isGoogleLoaded || isLoading}
            className="w-full bg-white text-black hover:bg-gray-100 h-14 rounded-[5px] font-[600] text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>로그인 중...</span>
            ) : (
              <>
                <img
                  src="/logos/google.png"
                  alt="구글 로그인"
                  width={20}
                  height={20}
                />
                구글 로그인
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
