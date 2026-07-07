import Queue from 'bull';

const syncQueue = new Queue('sync', { redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 } });

syncQueue.process('apply-patch', async (job) => {
  const { changeSetId, projectId } = job.data;
  console.log(`Applying patch ${changeSetId} for project ${projectId}`);
  // Sync processing logic here
  return { success: true };
});

console.log('Sync worker started, waiting for jobs...');
