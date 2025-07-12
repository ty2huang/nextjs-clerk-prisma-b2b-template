"use client";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center text-center bg-gray-50 w-full">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            <button 
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 