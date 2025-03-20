export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <nav className="p-4 bg-gray-800 text-center">Video Chat</nav>
        {children}
      </body>
    </html>
  );
}
