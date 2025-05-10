export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-16 h-16 border-4 border-t-4 border-blue-900 border-solid rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-600 animate-pulse">
        Please wait while we prepare your page...
      </p>
    </div>
  );
}
