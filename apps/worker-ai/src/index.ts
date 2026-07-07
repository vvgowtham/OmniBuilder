console.log('AI worker started, waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('AI worker shutting down...');
  process.exit(0);
});

// Keep process alive
setInterval(() => {}, 10000);
