import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import TopNav from "@/components/TopNav";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <TopNav />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
