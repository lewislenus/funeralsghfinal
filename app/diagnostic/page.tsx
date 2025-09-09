"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DiagnosticInfo = {
  browserInfo: string;
  nextInfo: string;
  errors: string[];
};

export default function DiagnosticPage() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo>({
    browserInfo: "",
    nextInfo: "",
    errors: [],
  });

  useEffect(() => {
    // Collect browser information
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
    };

    // Collect Next.js information
    const nextInfo = {
      nextData: window.__NEXT_DATA__ ? "Available" : "Not available",
      buildId: window.__NEXT_DATA__?.buildId || "Unknown",
    };

    setDiagnosticInfo({
      browserInfo: JSON.stringify(browserInfo, null, 2),
      nextInfo: JSON.stringify(nextInfo, null, 2),
      errors: [],
    });

    // Set up error tracking
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      setDiagnosticInfo((prev) => ({
        ...prev,
        errors: [...prev.errors, args.join(" ")],
      }));
      originalConsoleError(...args);
    };

    // Listen for uncaught errors
    const handleError = (event: ErrorEvent) => {
      setDiagnosticInfo((prev) => ({
        ...prev,
        errors: [
          ...prev.errors,
          `Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
        ],
      }));
    };

    window.addEventListener("error", handleError);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Information</h1>

      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {diagnosticInfo.browserInfo}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next.js Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {diagnosticInfo.nextInfo}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Log</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnosticInfo.errors.length === 0 ? (
              <p>No errors detected.</p>
            ) : (
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-red-600">
                {diagnosticInfo.errors.join("\n\n")}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            alert("Storage cleared!");
          }}
        >
          Clear Local Storage
        </Button>
        <Button onClick={() => window.location.reload()}>
          Hard Reload
        </Button>
      </div>
    </div>
  );
}
