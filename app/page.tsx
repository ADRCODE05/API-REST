"use client"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-6">
        Riwi Employability
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
        Comprehensive platform for managing technology vacancies and tracking applications.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="http://localhost:3001/api/docs"
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
        >
          API Documentation (Swagger)
        </a>
        <a
          href="/frontend/index.html"
          className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all"
        >
          View Vacancies
        </a>
      </div>
      <footer className="mt-20 text-gray-500 dark:text-gray-400 text-sm">
        &copy; 2026 Riwi Employability. All rights reserved.
      </footer>
    </div>
  )
}