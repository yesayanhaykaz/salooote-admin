import "./globals.css";
export const metadata = { title: "Salooote Admin", description: "Salooote Admin Portal" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
