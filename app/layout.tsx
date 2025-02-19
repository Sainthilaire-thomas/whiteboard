import CustomThemeProvider from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {/* ✅ On met le `ThemeProvider` DANS LE BODY pour éviter un Server Component global */}
        <CustomThemeProvider>{children}</CustomThemeProvider>
      </body>
    </html>
  );
}
