import { exceptions } from 'winston';
import ConfigManager from '../../src/config/ConfigManager.js';
import CONFIG from '../mocks/config.js';

afterEach(() => {
    process.env.NODE_ENV = 'test';
});

describe('ConfigManager Test Suite', () => {
    describe('compareEnvironment test suite', () => {
        test("Returns false if the parameter isn't the environment", () => {
            expect(ConfigManager.compareEnvironment('production')).toBe(false);
        });

        test('Returns true if the parameter is the environment', () => {
            expect(ConfigManager.compareEnvironment('test')).toBe(true);
        });

        test('Returns true if the environment is not set and the parameter is development', () => {
            delete process.env.NODE_ENV;
            expect(ConfigManager.compareEnvironment('development')).toBe(true);
        });

        test("Returns true if the environment is not set and the parameter isn't development", () => {
            delete process.env.NODE_ENV;
            expect(ConfigManager.compareEnvironment('test')).toBe(false);
        });

        test('Throws an error if the parameter is not a string', () => {
            expect(() => {
                ConfigManager.compareEnvironment(true);
            }).toThrow();
        });

        test('Throws an error if the parameter is missing', () => {
            expect(() => {
                ConfigManager.compareEnvironment();
            }).toThrow();
        });
    });

    describe('Static getEnvVariable test suite', () => {
        test('Returns the value of the corresponding environment variable', () => {
            const environmentVariableName = Object.keys(process.env)[0];
            expect(ConfigManager.getEnvVariable(environmentVariableName)).toEqual(process.env[environmentVariableName]);
        });

        test('Throws an error if the parameter is not a string', () => {
            expect(() => {
                ConfigManager.getEnvVariable(true);
            }).toThrow();
        });

        test('Throws an error if the parameter is missing', () => {
            expect(() => {
                ConfigManager.getEnvVariable();
            }).toThrow();
        });

        test("Throws an error if the environment variable doesn't exist", () => {
            const environmentVariableName = 'aaaaa';
            if (process.env[environmentVariableName]) {
                throw `The test can\'t be conducted, the environment variable ${environmentVariableName} exists`;
            }

            expect(() => {
                ConfigManager.getEnvVariable(environmentVariableName);
            }).toThrow();
        });
    });

    describe('getEnvVariable test suite', () => {
        test('Returns the value of the corresponding environment variable', () => {
            const environmentVariableName = Object.keys(process.env)[0];
            const configManager = new ConfigManager();
            expect(configManager.getEnvVariable(environmentVariableName)).toEqual(process.env[environmentVariableName]);
        });

        test('Throws an error if the parameter is not a string', () => {
            const configManager = new ConfigManager();
            expect(() => {
                configManager.getEnvVariable(true);
            }).toThrow();
        });

        test('Throws an error if the parameter is missing', () => {
            const configManager = new ConfigManager();
            expect(() => {
                configManager.getEnvVariable();
            }).toThrow();
        });

        test("Throws an error if the environment variable doesn't exist", () => {
            const configManager = new ConfigManager();
            const environmentVariableName = 'aaaaa';
            if (process.env[environmentVariableName]) {
                throw `The test can\'t be conducted, the environment variable ${environmentVariableName} exists`;
            }

            expect(() => {
                configManager.getEnvVariable(environmentVariableName);
            }).toThrow();
        });
    });

    describe('getConfig test suite', () => {
        test('The methods returns the configuration setting', () => {
            const config = new ConfigManager(CONFIG);
            const settingValue = config.getConfig('property1');
            expect(settingValue).toEqual(CONFIG.property1);
        });

        test('The methods returns the configuration setting when settings are nested', () => {
            const config = new ConfigManager(CONFIG);
            const settingValue = config.getConfig('propertyObject.subProperty1');
            expect(settingValue).toEqual(CONFIG.propertyObject.subProperty1);
        });

        test('The methods returns the configuration setting when settings is in an array', () => {
            const config = new ConfigManager(CONFIG);
            const settingValue = config.getConfig('propertyArray[0]');
            expect(settingValue).toEqual(CONFIG.propertyArray[0]);
        });

        test('The methods returns all the settings with the root selector', () => {
            const config = new ConfigManager(CONFIG);
            const settingValue = config.getConfig('');
            expect(settingValue).toEqual(CONFIG);
        });

        test("The methods throws an error if the setting doesn't exists", () => {
            const config = new ConfigManager();
            expect(() => {
                config.getConfig('testSetting');
            }).toThrow();
        });

        test('The methods throws an error if an index is not an index', () => {
            const config = new ConfigManager();
            expect(() => {
                config.getConfig('logging.login.output[a]');
            }).toThrow();
        });

        test('The methods throws an error if the fetched setting is not a valid string', () => {
            const config = new ConfigManager();
            expect(() => {
                config.getConfig(true);
            }).toThrow();
        });

        test('No settings are saved if the object is empty', () => {
            const config = new ConfigManager();
            const allSettings = config.getConfig('');
            expect(allSettings).toEqual({});
        });
    });
});
