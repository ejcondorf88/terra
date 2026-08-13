'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [user, token, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  function handleLogout() {
    logout();
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Terra GO Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Perfil */}
            <div className="md:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900">{user?.nombre}</h2>
                <p className="mt-1 text-gray-600">{user?.email}</p>
                <p className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {user?.rol === 'productor' ? 'Productor Agrícola' : 'Inversionista'}
                  </span>
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
                  <p className="text-lg font-mono text-gray-900">{user?.id}</p>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900">Mis Lotes</h3>
                  <p className="mt-2 text-4xl font-bold text-green-600">0</p>
                  <p className="mt-2 text-sm text-gray-600">Lotes registrados en la plataforma</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900">NFTs Creados</h3>
                  <p className="mt-2 text-4xl font-bold text-blue-600">0</p>
                  <p className="mt-2 text-sm text-gray-600">Activos digitales creados</p>
                </div>
              </div>

              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  {user?.rol === 'productor' && (
                    <>
                      <Link
                        href="/lotes/new"
                        className="block px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 text-center"
                      >
                        Registrar Nuevo Lote
                      </Link>
                      <Link
                        href="/nfts/mint"
                        className="block px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 text-center"
                      >
                        Tokenizar Lote
                      </Link>
                    </>
                  )}
                  {user?.rol === 'inversionista' && (
                    <>
                      <Link
                        href="/marketplace"
                        className="block px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 text-center"
                      >
                        Ver Marketplace
                      </Link>
                      <Link
                        href="/portfolio"
                        className="block px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 text-center"
                      >
                        Mi Portafolio
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <p className="text-sm text-blue-700">
                    <strong>Bienvenido a Terra GO!</strong> Este es tu espacio personal para gestionar
                    activos agrícolas tokenizados. Explora las opciones disponibles según tu perfil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
