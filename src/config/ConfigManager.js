import { validateStringArgument } from '../utils/utils-functions.js';
import ConfigurationError from '../errors/ConfigurationError.js';
import CONFIG from './config.js';

/**
 * Manages server configuration.
 * Allows for easy access to configuration settings, as well as all environment variable.
 * Custom environment variables should be inserted in the CLI, or included with dotenv using preloading.
 */
export default class ConfigManager {
    /**
     * Stores configuration settings.
     * @private
     * @member {Object}
     */
    #configurationSettings = {};

    /**
     * Initialises the configurationSettings and the environment property.
     * @param {Object} [config={}] - Configuration object. Default to empty object if no configuration object is used.
     */
    constructor(config = {}) {
        this.#configurationSettings = config;
    }

    /**
     * Compare the givent environment with the current environment.
     * @param {string} environment - The environment name to test.
     * @return {boolean} Returns true if the given environment is the current environment, and false otherwise.
     * @static
     */
    static compareEnvironment(environment) {
        if (!validateStringArgument(environment)) {
            throw new ConfigurationError('The environment name must be a valid string.');
        }

        if (environment === process.env.NODE_ENV || (!process.env.NODE_ENV && environment === 'development')) {
            return true;
        }

        return false;
    }

    /**
     * Static method to return the value of an environment variable.
     * @param {string} variableName - Name of the environment variable. It is case insensitive.
     * @returns Returns the value of the environment variable.
     * @throws Throws an error if the variable name isn't a valid string or if the environment variable doesn't exist.
     * @static
     */
    static getEnvVariable(variableName) {
        if (!validateStringArgument(variableName)) {
            throw new ConfigurationError('The variable name must be a valid string.');
        }

        if (process.env[variableName]) {
            return process.env[variableName];
        }

        throw new ConfigurationError(`The environment variable ${variableName} doesn't exist`);
    }

    /**
     * Static method to return the configuration of the Json web token, depending on the environment.
     * The configuration is stored in the .env file, but in the test environment, simple default values are used.
     * @returns {Object} Returns the JsonWebToken configuration.
     * @throws Throws an error if the parameter don't exist.
     * @static
     */
    static getJwtConfig() {
        if (ConfigManager.compareEnvironment('test')) {
            return {
                key: 'TEST',
                iss: 'issuer',
                aud: 'audience',
                alg: 'HS256',
                exp: '24h',
            };
        }

        try {
            let jwtConfig = {};
            jwtConfig.key = ConfigManager.getEnvVariable('JWT_KEY');
            jwtConfig.iss = ConfigManager.getEnvVariable('JWT_ISS');
            jwtConfig.aud = ConfigManager.getEnvVariable('JWT_AUD');
            jwtConfig.alg = ConfigManager.getEnvVariable('JWT_ALG');
            jwtConfig.exp = ConfigManager.getEnvVariable('JWT_EXP');
            return jwtConfig;
        } catch (error) {
            throw new ConfigurationError(
                'The JsonWebToken key is not defined in the environment variables. Make sure to create a secure key and to give it the right variable name.'
            );
        }
    }

    /**
     * Non static version of the ConfigManager.compareEnvironment method.
     * @see ConfigManager.compareEnvironment
     */
    compareEnvironment(variableName) {
        return ConfigManager.compareEnvironment(variableName);
    }

    /**
     * Non static version of the ConfigManager.getEnvVariable method.
     * @see ConfigManager.getEnvVariable
     */
    getEnvVariable(variableName) {
        return ConfigManager.getEnvVariable(variableName);
    }

    /**
     * Non static version of the ConfigManager.getJwtConfig method.
     * @see ConfigManager.getJwtConfig
     */
    getJwtConfig() {
        return ConfigManager.getJwtConfig();
    }

    /**
     * Returns the fetched configuration setting.
     * @param {string} [setting=''] - Setting path. It should follow the JavaScript notation. If the property is nested inside others, the path should look like 'ancestor.parent.property'. If one propety is an element of an array, the path should be 'parent[i]' where i is the index in the array. An empty string is equivalent to the root of the settings and returns the entire configurationSettings property.
     * @returns Returns the value of the setting. If the setting is an array, returns the array. If the settings contains other settings, return an object containing all the settings.
     * @throws {Object} Throws an error if the setting path is invalid or if the setting doesn't exists.
     */
    getConfig(setting = '') {
        if (!validateStringArgument(setting)) {
            throw new ConfigurationError('The setting name must be a valid string.');
        }

        // Return all the settings if the value is an empty string
        if (setting === '') {
            return this.#configurationSettings;
        }

        // Parse the setting path and return the setting, or an error.
        // Separate the setting path into the different properties
        const settingPath = setting.split('.');
        let currentSetting = this.#configurationSettings;

        for (let settingPathNode of settingPath) {
            // Separate the property name from the index, if there is one
            let settingNodeDetails = settingPathNode.split('[');

            if (!currentSetting[settingNodeDetails[0]]) {
                throw new ConfigurationError(`The setting or environment variable ${setting} doesn't exist.`);
            }

            // Set the current setting to the property name value
            currentSetting = currentSetting[settingNodeDetails[0]];

            if (settingNodeDetails[1]) {
                let settingIndex = parseInt(settingNodeDetails[1], 10);
                if (isNaN(settingIndex)) {
                    throw new ConfigurationError(
                        `The index of the setting node ${settingNodeDetails[0]} must be a valid number.`
                    );
                }
                // Set the current setting to the value behind the index of the property name
                currentSetting = currentSetting[settingIndex];
            }
        }

        return currentSetting;
    }
}

/**
 * Default configuration manager, using the config.js file in the same directory.
 */
export const defaultConfigManager = new ConfigManager(CONFIG);
