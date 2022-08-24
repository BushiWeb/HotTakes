import validator from 'validator';
import Logger, { createDebugNamespace } from '../logger/logger.js';
import { defaultConfigManager } from '../config/ConfigManager.js';

const validationDebug = createDebugNamespace('hottakes:validation');

/**
 * Use validator to check that the password is strong enough.
 */
let passwordStrenghtValidationParameters = {};
try {
    passwordStrenghtValidationParameters = defaultConfigManager.getConfig('passwordValidation');
    validationDebug({
        message: 'Password strenght validation parameters acquired: %o',
        splat: [passwordStrenghtValidationParameters],
    });
} catch (error) {
    Logger.error(error);
    Logger.warn(`Couldn't set the password strength validation parameters. Default values will be used.`);
}

/**
 * Custom password format error message, containing the rules for a strong password.
 */
export const passwordFormat = (value) => {
    return validator.isStrongPassword(value, passwordStrenghtValidationParameters);
};
export const passwordErrorMessage = `must be a valid strong password, i.e. a string containing at least ${
    passwordStrenghtValidationParameters.minLength || 8
} caracters including ${passwordStrenghtValidationParameters.minLowercase || 1} lowercase letters, ${
    passwordStrenghtValidationParameters.minUppercase || 1
} uppercase letters, ${passwordStrenghtValidationParameters.minNumbers || 1} numbers and ${
    passwordStrenghtValidationParameters.minSymbols || 1
} symbols.`;

/**
 * Use validator to check that the userId is a mongoDB id.
 */
export const mongoIdFormat = (value) => {
    return validator.isMongoId(value);
};
