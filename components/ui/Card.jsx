export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${className}`}>
      {children}
    </p>
  );
}
