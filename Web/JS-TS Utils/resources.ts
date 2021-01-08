import {environment} from '../environments/environment';

function getResource(resourceName: string) {
  if (environment.serverURL) {
    return environment.serverURL + '/' + resourceName;
  }
  return resourceName;
}

export {
  getResource
};
