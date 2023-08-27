/**
 *******************************************************************************************************
 * This script is used to manage the various web configurations needed while developing the mobile app *
 *******************************************************************************************************
 **/

import {access, constants, copyFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
import {envTemplate} from '../../configurations/environments/environment-template.js';
import environmentConfigs from '../../configurations/environments/environments.json' assert {type: 'json'};

const environmentSavePath = 'src/environments';
const globalConfigFolder = 'configurations/global-configs';
const globalConfigSavePath = 'src/assets/configuration/';
const DEFAULT_ENV_NAME = 'trinov';

export async function setupWebConfig(envName, isProduction) {
    await setupEnvironment(envName, isProduction);
    console.log('Environment Setup Successful!!');
    await setupGlobalConfig(envName);
    console.log('Global Config Setup Successful!!');
}

export async function setupEnvironment(envName, isProduction) {
    if (!envName) envName = DEFAULT_ENV_NAME;
    let environmentConfig = {
        ...envTemplate,
        ...environmentConfigs[envName]
    };
    if (isProduction) {
        environmentConfig = {...environmentConfig, ...environmentConfigs['production']};
    }
    // get the string representation of object
    const objectAsString = util.inspect(environmentConfig, {depth: 5, compact: false});
    let data = `export const environment = ${objectAsString};\n`;
    data = data.replace(/^(\s+)/gm, '$1$1'); // double starting spaces from 2 to 4
    await writeFile(path.join(environmentSavePath, 'environment.ts'), data, {encoding: 'utf-8'});
}

export async function setupGlobalConfig(envName) {
    let source = path.join(globalConfigFolder, `${envName}-global-config.json`);
    const destination = path.join(globalConfigSavePath, 'global-config.json');
    try {
        await access(source, constants.F_OK);
    }
    catch (e) {
        source = path.join(globalConfigFolder, `${DEFAULT_ENV_NAME}-global-config.json`);
    }
    await copyFile(source, destination);
}
