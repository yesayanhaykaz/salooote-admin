import "./globals.css";
import LocaleProvider from "@/components/LocaleProvider";

export const metadata = { title: "Salooote Admin", description: "Salooote Admin Portal" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
