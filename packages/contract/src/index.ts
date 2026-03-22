import { catalogContract } from './catalog.js';
import { callbacksContract } from './callbacks.js';
import { cmsContract } from './cms.js';
import { uploadContract } from './upload.js';
import { dashboardContract } from './dashboard.js';

export const contract = {
  catalog: catalogContract,
  callbacks: callbacksContract,
  cms: cmsContract,
  upload: uploadContract,
  dashboard: dashboardContract,
};

export {
  catalogContract,
  callbacksContract,
  cmsContract,
  uploadContract,
  dashboardContract,
};
