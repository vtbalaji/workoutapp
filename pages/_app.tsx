import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import TopNav from "@/components/TopNav";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isWorkoutPlayer = router.pathname === "/workout-player";

  return (
    <AuthProvider>
      {!isWorkoutPlayer && <TopNav />}
      <Component {...pageProps} />
    </AuthProvider>
  );
}
