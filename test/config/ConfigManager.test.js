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

        test('The methods returns the environment variable', () => {
            const settingName = Object.keys(process.env)[0];
            const config = new ConfigManager();
            const settingValue = config.getConfig(settingName);
            expect(settingValue).toEqual(process.env[settingName]);
        });

        test('The methods returns all the settings with the root selector', () => {
            const config = new ConfigManager(CONFIG);
            const settingValue = config.getConfig('');
            expect(settingValue).toEqual(CONFIG);
        });

        test("The methods throws an error if the setting doesn't exists", () => {
            const config = new ConfigManager();
            expect(() => {
                config.getConfig('models');
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
                config.getConfig(null);
            }).toThrow();
        });

        test('No settings are saved if the object is empty', () => {
            const config = new ConfigManager();
            const allSettings = config.getConfig('');
            expect(allSettings).toEqual({});
        });

        test('Returns the value of NODE_ENV if the parameter is env', () => {
            const config = new ConfigManager();
            const envNode = config.getConfig('env');
            expect(envNode).toBe('test');
        });

        test('Returns the value of NODE_ENV if the parameter is NODE_ENV', () => {
            const config = new ConfigManager();
            const envNode = config.getConfig('NODE_ENV');
            expect(envNode).toBe('test');
        });

        test('Returns development if NODE_ENV is not defined', () => {
            delete process.env.NODE_ENV;
            const config = new ConfigManager();
            const envNode = config.getConfig('NODE_ENV');
            expect(envNode).toBe('development');
        });
    });
});