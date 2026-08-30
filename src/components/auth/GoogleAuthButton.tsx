"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason: () => string }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
            }
          ) => void;
        };
      };
    };
  }
}

export interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onLinkRequired?: (data: { email: string; idToken: string }) => void;
  mode?: "signin" | "signup";
  className?: string;
}

export function GoogleAuthButton({
  onSuccess,
  onError,
  onLinkRequired,
  mode = "signin",
  className = "",
}: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const hiddenGisRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "mock-google-client-id-thevrindagroup.apps.googleusercontent.com";

  // Handle Google Token response from Google Identity Services
  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) {
        if (onError) onError("Google authentication failed. No credential returned.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await loginWithGoogle(response.credential);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else if (res.code === "GOOGLE_ACCOUNT_LINK_REQUIRED") {
          if (onLinkRequired) {
            onLinkRequired({
              email: res.user?.email || "",
              idToken: response.credential,
            });
          } else if (onError) {
            onError(res.error || "An account with this email exists. Please sign in with password to link Google.");
          }
        } else {
          if (onError) onError(res.error || "Google authentication failed. Please try again.");
        }
      } catch {
        if (onError) onError("Google authentication failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [loginWithGoogle, onError, onLinkRequired, onSuccess]
  );

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      const timer = setTimeout(() => setGisLoaded(true), 0);
      return () => clearTimeout(timer);
    }

    const existingScript = document.getElementById("google-gis-sdk");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gis-sdk";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGisLoaded(true);
      };
      script.onerror = () => {
        console.warn("Failed to load Google Identity Services SDK.");
      };
      document.head.appendChild(script);
    } else {
      const onLoadHandler = () => setGisLoaded(true);
      existingScript.addEventListener("load", onLoadHandler);
      return () => {
        existingScript.removeEventListener("load", onLoadHandler);
      };
    }
  }, []);

  // Initialize GIS when loaded
  useEffect(() => {
    if (!gisLoaded || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (hiddenGisRef.current) {
        hiddenGisRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hiddenGisRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          width: 320,
        });
      }
    } catch (err) {
      console.warn("Error initializing Google Identity Services:", err);
    }
  }, [gisLoaded, clientId, mode, handleCredentialResponse]);

  const handleClick = () => {
    if (isLoading) return;

    if (window.google?.accounts?.id) {
      setIsLoading(true);
      try {
        // Trigger Google One-Tap or native GIS prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap is suppressed or skipped, click hidden official GIS button
            const gisBtn = hiddenGisRef.current?.querySelector('div[role="button"]') as HTMLElement;
            if (gisBtn) {
              gisBtn.click();
            } else {
              setIsLoading(false);
            }
          }
        });
      } catch {
        setIsLoading(false);
      }
    } else {
      if (onError) onError("Google Sign-In service is initializing. Please try again in a moment.");
    }
  };

  return (
    <div className="w-full">
      {/* Hidden container for rendering native Google button for programmatic click */}
      <div ref={hiddenGisRef} className="hidden pointer-events-none" aria-hidden="true" />

      {/* Styled Brand Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleClick}
        className={`w-full h-11 rounded-xl border border-border-default bg-white hover:bg-bg-light text-text-primary text-xs font-bold flex items-center justify-center gap-2.5 shadow-soft-xs transition-all cursor-pointer active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-accent-gold animate-spin" />
            <span className="text-text-secondary">Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}

export default GoogleAuthButton;
