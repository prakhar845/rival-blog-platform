export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      {}
      <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
    </div>
  );
}