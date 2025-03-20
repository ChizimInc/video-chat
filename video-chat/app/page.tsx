import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Video Chat App</h1>
      <div className="space-x-4">
        <Link href="/chat/create">
          <button className="px-6 py-2 bg-blue-500 rounded-lg">Create a chat</button>
        </Link>
        <Link href="/chat/join">
          <button className="px-6 py-2 bg-green-500 rounded-lg">Join</button>
        </Link>
      </div>
    </main>
  );
}
