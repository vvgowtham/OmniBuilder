import Queue from 'bull';

const importQueue = new Queue('imports', { redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 } });

importQueue.process('process-import', async (job) => {
  const { importId, projectId, kind, sourceRef } = job.data;
  console.log(`Processing import ${importId} for project ${projectId}`);
  console.log(`Source: ${kind} - ${sourceRef}`);
  // Import processing logic here
  await job.progress(100);
  return { success: true };
});

console.log('Analysis worker started, waiting for jobs...');
