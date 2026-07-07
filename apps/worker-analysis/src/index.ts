console.log('Analysis worker started, waiting for jobs...');

process.on('SIGINT', () => {
  console.log('Analysis worker shutting down...');
  process.exit(0);
});

setInterval(() => {}, 10000);
