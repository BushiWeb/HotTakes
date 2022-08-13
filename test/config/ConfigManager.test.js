import ConfigManager from '../../src/config/ConfigManager.js';
import CONFIG from '../mocks/config.js';
import ConfigurationError from '../../src/errors/ConfigurationError.js';

afterEach(() => {
    process.env.NODE_ENV = 'test';
});

describe('ConfigManager Test Suite', () => {
    describe('Static methods test suite', () => {
        describe('Static compareEnvironment test suite', () => {
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

            test("Returns false if the environment is not set and the parameter isn't development", () => {
                delete process.env.NODE_ENV;
                expect(ConfigManager.compareEnvironment('test')).toBe(false);
            });

            test('Throws an error if the parameter is not a string', () => {
                expect(() => {
                    ConfigManager.compareEnvironment(true);
                }).toThrow(ConfigurationError);
            });

            test('Throws an error if the parameter is missing', () => {
                expect(() => {
                    ConfigManager.compareEnvironment();
                }).toThrow(ConfigurationError);
            });
        });

        describe('Static getEnvVariable test suite', () => {
            test('Returns the value of the corresponding environment variable', () => {
                const environmentVariableName = Object.keys(process.env)[0];
                expect(ConfigManager.getEnvVariable(environmentVariableName)).toEqual(
                    process.env[environmentVariableName]
                );
            });

            test('Throws an error if the parameter is not a string', () => {
                expect(() => {
                    ConfigManager.getEnvVariable(true);
                }).toThrow(ConfigurationError);
            });

            test('Throws an error if the parameter is missing', () => {
                expect(() => {
                    ConfigManager.getEnvVariable();
                }).toThrow(ConfigurationError);
            });

            test("Throws an error if the environment variable doesn't exist", () => {
                const environmentVariableName = 'aaaaa';
                if (process.env[environmentVariableName]) {
                    throw `The test can\'t be conducted, the environment variable ${environmentVariableName} exists`;
                }

                expect(() => {
                    ConfigManager.getEnvVariable(environmentVariableName);
                }).toThrow(ConfigurationError);
            });
        });

        describe('Static getJwtKey test suite', () => {
            test('Returns TEST in the testing environment', () => {
                expect(ConfigManager.getJwtKey()).toBe('TEST');
            });

            test('Returns the right value if not in the testing environment', () => {
                process.env.NODE_ENV = 'development';
                process.env.JWT_KEY = 'KEY';
                expect(ConfigManager.getJwtKey()).toBe(process.env.JWT_KEY);

                delete process.env.JWT_KEY;
            });

            test('Throws an error if not in the testing environment and the JWT key is not set', () => {
                process.env.NODE_ENV = 'development';
                expect(() => {
                    ConfigManager.getJwtKey();
                }).toThrow(ConfigurationError);
            });
        });
    });

    describe('Instance methods test suite', () => {
        let configManager;

        beforeEach(() => {
            configManager = new ConfigManager(CONFIG);
        });

        describe('compareEnvironment test suite', () => {
            test("Returns false if the parameter isn't the environment", () => {
                expect(configManager.compareEnvironment('production')).toBe(false);
            });

            test('Returns true if the parameter is the environment', () => {
                expect(configManager.compareEnvironment('test')).toBe(true);
            });

            test('Returns true if the environment is not set and the parameter is development', () => {
                delete process.env.NODE_ENV;
                expect(configManager.compareEnvironment('development')).toBe(true);
            });

            test("Returns false if the environment is not set and the parameter isn't development", () => {
                delete process.env.NODE_ENV;
                expect(configManager.compareEnvironment('test')).toBe(false);
            });

            test('Throws an error if the parameter is not a string', () => {
                expect(() => {
                    configManager.compareEnvironment(true);
                }).toThrow(ConfigurationError);
            });

            test('Throws an error if the parameter is missing', () => {
                expect(() => {
                    configManager.compareEnvironment();
                }).toThrow(ConfigurationError);
            });
        });

        describe('getEnvVariable test suite', () => {
            test('Returns the value of the corresponding environment variable', () => {
                const environmentVariableName = Object.keys(process.env)[0];
                expect(configManager.getEnvVariable(environmentVariableName)).toEqual(
                    process.env[environmentVariableName]
                );
            });

            test('Throws an error if the parameter is not a string', () => {
                expect(() => {
                    configManager.getEnvVariable(true);
                }).toThrow(ConfigurationError);
            });

            test('Throws an error if the parameter is missing', () => {
                expect(() => {
                    configManager.getEnvVariable();
                }).toThrow(ConfigurationError);
            });

            test("Throws an error if the environment variable doesn't exist", () => {
                const environmentVariableName = 'aaaaa';
                if (process.env[environmentVariableName]) {
                    throw `The test can\'t be conducted, the environment variable ${environmentVariableName} exists`;
                }

                expect(() => {
                    configManager.getEnvVariable(environmentVariableName);
                }).toThrow(ConfigurationError);
            });
        });

        describe('getJwtKey test suite', () => {
            test('Returns TEST in the testing environment', () => {
                expect(configManager.getJwtKey()).toBe('TEST');
            });

            test('Returns the right value if not in the testing environment', () => {
                process.env.NODE_ENV = 'development';
                process.env.JWT_KEY = 'KEY';
                expect(configManager.getJwtKey()).toBe(process.env.JWT_KEY);

                delete process.env.JWT_KEY;
            });

            test('Throws an error if not in the testing environment and the JWT key is not set', () => {
                process.env.NODE_ENV = 'development';
                expect(() => {
                    configManager.getJwtKey();
                }).toThrow(ConfigurationError);
            });
        });

        describe('getConfig test suite', () => {
            test('The methods returns the configuration setting', () => {
                expect(configManager.getConfig('property1')).toEqual(CONFIG.property1);
            });

            test('The methods returns the configuration setting when settings are nested', () => {
                expect(configManager.getConfig('propertyObject.subProperty1')).toEqual(
                    CONFIG.propertyObject.subProperty1
                );
            });

            test('The methods returns the configuration setting when settings is in an array', () => {
                expect(configManager.getConfig('propertyArray[0]')).toEqual(CONFIG.propertyArray[0]);
            });

            test('The methods returns all the settings with the root selector', () => {
                expect(configManager.getConfig('')).toEqual(CONFIG);
            });

            test('The methods returns all the settings if no selector is given', () => {
                expect(configManager.getConfig()).toEqual(CONFIG);
            });

            test("The methods throws an error if the setting doesn't exists", () => {
                expect(() => {
                    configManager.getConfig('testSetting');
                }).toThrow(ConfigurationError);
            });

            test('The methods throws an error if an index is not an index', () => {
                expect(() => {
                    configManager.getConfig('propertyArray[a]');
                }).toThrow(ConfigurationError);
            });

            test('The methods throws an error if the fetched setting is not a valid string', () => {
                expect(() => {
                    configManager.getConfig(true);
                }).toThrow(ConfigurationError);
            });

            test('No settings are saved if the object is empty', () => {
                configManager = new ConfigManager();
                expect(configManager.getConfig('')).toEqual({});
            });
        });
    });
});
