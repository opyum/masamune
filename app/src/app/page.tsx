import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Masamune</h1>
      <p className="text-xl text-gray-600 mb-8">
        Créez votre site professionnel en 5 minutes grâce à l&apos;IA
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Commencer gratuitement
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
