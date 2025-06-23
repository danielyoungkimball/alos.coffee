// Simple client logger for user interactions
const isProd = process.env.NODE_ENV === 'production';

function log(level: 'info' | 'warn' | 'error', ...args: any[]) {
  console.log('hit');
  console.log('isProd', isProd);
  if (!isProd) {
    // In dev, log to the browser console
    console[level](...args);
  } else {
    // In prod, optionally send logs to a backend endpoint
    // fetch('/api/log', { method: 'POST', body: JSON.stringify({ level, args }) });
  }
}

const clientLogger = {
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
};

export default clientLogger; 