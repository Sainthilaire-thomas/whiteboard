"use client";

// app/layout.tsx (Root Layout)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomThemeProvider from "@/app/components/common/Theme/ThemeProvider";
import { CurrentViewProvider } from "@/hooks/whiteboard/useCurrentView";
import { CallDataProvider } from "@/context/CallDataContext";
import { ZohoProvider } from "@/context/ZohoContext";
import { TaggingDataProvider } from "@/context/TaggingDataContext";
import { AppProvider } from "@/context/AppContext";
import GlobalNavBar from "./components/common/GlobalNavBar"; // Importer la GlobalNavBar
import { SupabaseProvider } from "@/context/SupabaseContext";
import { ConseillerProvider } from "@/context/ConseillerContext";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider>
            <AppProvider>
              <ZohoProvider>
                <TaggingDataProvider>
                  <CurrentViewProvider>
                    <ConseillerProvider>
                      <CustomThemeProvider>
                        <div>
                          <GlobalNavBar /> {/* Navbar globale */}
                          <main>{children}</main> {/* Le contenu de la page */}
                        </div>
                      </CustomThemeProvider>
                    </ConseillerProvider>
                  </CurrentViewProvider>
                </TaggingDataProvider>
              </ZohoProvider>
            </AppProvider>{" "}
          </SupabaseProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
