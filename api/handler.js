import serverless from 'serverless-http';
import app from './index.js';  // aquí exportamos la app de express

export const main = serverless(app);
