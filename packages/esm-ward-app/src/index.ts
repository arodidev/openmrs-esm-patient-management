import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import rootComponent from './root.component';
import { moduleName } from './constant';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'ward',
  moduleName,
};

export const root = getSyncLifecycle(rootComponent, options);

export const admissionRequestWorkspace = getAsyncLifecycle(
  () => import('./ward-workspace/admission-requests-workspace.component'),
  options,
);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
  registerFeatureFlag(
    'bedmanagement-module',
    'Bed Management Module',
    'Enables features related to bed management / assignment. Requires the backend bed management module to be installed.',
  );
}
