"use client";

// app/layout.tsx (Root Layout)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomThemeProvider from "@/app/components/common/Theme/ThemeProvider";

import { CurrentViewProvider } from "@/hooks/whiteboard/useCurrentView";
import RootProvider from "@/context/RootProvider";
import { ZohoProvider } from "@/context/ZohoContext";
import { TaggingDataProvider } from "@/context/TaggingDataContext";
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
            <RootProvider>
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
            </RootProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
