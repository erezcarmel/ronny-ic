const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Set memory limit to 450MB (below Render's 512MB limit)
const v8 = require('v8');
const totalHeapSizeThreshold = 450 * 1024 * 1024; // 450MB in bytes

// Check memory usage periodically
function monitorMemoryUsage() {
  const heapStats = v8.getHeapStatistics();
  const totalHeapSize = heapStats.total_heap_size;
  
  if (totalHeapSize > totalHeapSizeThreshold) {
    console.warn(`WARNING: High memory usage detected: ${Math.round(totalHeapSize / 1024 / 1024)}MB`);
    
    // Force garbage collection if possible (requires --expose-gc flag)
    if (global.gc) {
      console.log('Forcing garbage collection...');
      global.gc();
    }
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Monitor memory on each request
      monitorMemoryUsage();
      
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
  
  // Also monitor memory usage periodically
  setInterval(monitorMemoryUsage, 30000); // Check every 30 seconds
});
