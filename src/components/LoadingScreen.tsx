export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}