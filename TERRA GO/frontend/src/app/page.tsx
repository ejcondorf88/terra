'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, token } = useAuth();
  const router = useRouter();

  if (user && token) {
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Terra GO</h1>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Terra GO Marketplace
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Conectamos productores agrícolas con inversionistas a través de la blockchain. 
            Certificación EUDR, tokenización de activos y comercio justo para todos.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Soy Productor
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-3 rounded-lg border-2 border-green-600 text-green-600 font-medium hover:bg-green-50 transition"
            >
              Soy Inversionista
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-900">Certificación EUDR</h3>
            <p className="mt-2 text-gray-600">
              Verifica la trazabilidad y cumplimiento regulatorio de productos agrícolas.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-4xl mb-4">🪙</div>
            <h3 className="text-xl font-bold text-gray-900">Tokenización</h3>
            <p className="mt-2 text-gray-600">
              Convierte tus lotes en NFTs únicos con metadatos verificables en blockchain.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-4xl mb-4">💱</div>
            <h3 className="text-xl font-bold text-gray-900">Marketplace DeFi</h3>
            <p className="mt-2 text-gray-600">
              Compra y vende activos agrícolas con criptodivisas y stablecoins directamente.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 bg-green-900 rounded-lg shadow-lg p-12 text-white text-center">
          <h3 className="text-2xl font-bold mb-8">Nuestro Impacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-bold">100+</p>
              <p className="mt-2">Productores conectados</p>
            </div>
            <div>
              <p className="text-4xl font-bold">50+</p>
              <p className="mt-2">Inversionistas activos</p>
            </div>
            <div>
              <p className="text-4xl font-bold">$10M+</p>
              <p className="mt-2">Volumen de transacciones</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-gray-600 mb-8">
            Únete a la revolución del marketplace agrícola blockchain
          </p>
          <Link
            href="/auth/register"
            className="px-8 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition inline-block"
          >
            Crear cuenta ahora
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm">
          <p>© 2026 Terra GO. Marketplace agrícola blockchain. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
