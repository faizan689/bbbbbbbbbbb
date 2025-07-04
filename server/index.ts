import { createServer } from 'vite';
import { resolve } from 'path';

async function createViteServer() {
  const vite = await createServer({
    server: {
      host: '0.0.0.0',
      port: 5000
    },
    root: resolve(process.cwd(), 'client'),
    configFile: resolve(process.cwd(), 'vite.config.ts')
  });

  await vite.listen();
  vite.printUrls();
}

createViteServer().catch(console.error);