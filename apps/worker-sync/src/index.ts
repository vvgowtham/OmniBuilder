console.log('Sync worker started, waiting for jobs...');

process.on('SIGINT', () => {
  console.log('Sync worker shutting down...');
  process.exit(0);
});

setInterval(() => {}, 10000);
