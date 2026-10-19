"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Navbar } from "../../../components/navbar/Navbar";
import { Footer } from "../../../components/footer/Footer";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error") || searchParams.get("detail");

    if (error) {
      setStatus("error");
      setErrorMessage(error);
      return;
    }

    if (token) {
      try {
        localStorage.setItem("ubuntubio_token", token);
        setStatus("success");
        const timer = setTimeout(() => {
          router.push("/submit");
        }, 1500);
        return () => clearTimeout(timer);
      } catch (err) {
        setStatus("error");
        setErrorMessage("Failed to store authentication credentials locally.");
      }
    } else {
      setStatus("error");
      setErrorMessage("No authentication token was returned from the authorization server.");
    }
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <Loader2
              className="animate-spin"
              size={40}
              color="#00ed64"
              style={{ margin: "0 auto 1rem" }}
            />
            <h2 style={{ fontSize: "1.25rem", color: "#f9fafb", marginBottom: "0.5rem" }}>
              Authenticating with ORCID...
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              Verifying your researcher credentials and minting session token.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={44} color="#00ed64" style={{ margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.25rem", color: "#f9fafb", marginBottom: "0.5rem" }}>
              Successfully Signed In!
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Redirecting you to the portal...</p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle size={44} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.25rem", color: "#f9fafb", marginBottom: "0.5rem" }}>
              Authentication Failed
            </h2>
            <p style={{ color: "#f87171", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              {errorMessage}
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "#00ed64",
                color: "#000",
                fontWeight: 600,
                padding: "0.5rem 1.25rem",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Return Home
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <main id="main-content">
        <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
          <AuthCallbackContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
