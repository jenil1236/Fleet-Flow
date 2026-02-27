export function Input({ className = '', error, ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-colors ${
        error
          ? 'border-red-500 dark:border-red-500'
          : 'border-gray-200 dark:border-gray-700'
      } ${className}`}
      {...props}
    />
  );
}
