import {DebugUtils} from './debug';

function checkResponseHasProperty(response: any, property: string) {
  const keys = property.split('.');
  if (keys.length === 1) {
    return response.hasOwnProperty(property);
  }
  let currentLevel = response, level;
  for (level = 0; level < keys.length; level++) {
    if (!currentLevel.hasOwnProperty(keys[level])) {
      break;
    }
    currentLevel = currentLevel[keys[level]];
  }
  return level === keys.length;
}

function checkResponse(response: any, properties: string[]) {
  DebugUtils.debug('Response', response);
  return new Promise((resolve, reject) => {
    let unmatchedProperties = [];
    properties.forEach(property => {
      if (!checkResponseHasProperty(response, property)) {
        unmatchedProperties.push(property);
      }
    });
    if (unmatchedProperties.length > 0) {
      reject(new Error(`Response Object doesn't have the following properties: ${unmatchedProperties.join(' | ')}`))
    }
    resolve(response);
  });
}
