// Simple client logger for user interactions
const isProd = process.env.NODE_ENV === 'production';

function log(level: 'info' | 'warn' | 'error', ...args: unknown[]) {
  console.log('hit');
  console.log('isProd', isProd);
  if (!isProd) {
    // In dev, log to the browser console
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any)[level](...args);
  } else {
    // In prod, optionally send logs to a backend endpoint
    // fetch('/api/log', { method: 'POST', body: JSON.stringify({ level, args }) });
  }
}

const clientLogger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  event: (event: string, details?: unknown) => log('info', `[EVENT] ${event}`, details),
};

export default clientLogger; 