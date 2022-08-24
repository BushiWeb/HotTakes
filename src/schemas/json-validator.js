import credentialsSchema from './credentials-schema.js';
import likeSchema from './like-schema.js';
import { sauceSchema, sauceRequiredSchema } from './sauce-schema.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import { passwordFormat, mongoIdFormat } from './custom-formats.js';
import { createDebugNamespace } from '../logger/logger.js';

const validationDebug = createDebugNamespace('hottakes:validation');

// Creates a new Ajv instance. In case of additionnal unwanted properties, instead of throwing an error, these properties are going to be removed.
const ajv = new Ajv({
    removeAdditional: true,
    strictTypes: false,
    strictTuples: true,
    strictRequired: true,
    allErrors: true,
});
ajvErrors(ajv);
validationDebug('JSON schema validator initialisation');

//Adds all the formats
addFormats(ajv, ['email']);
validationDebug('JSON schema validator: add email format');
ajv.addFormat('password', passwordFormat);
validationDebug('JSON schema validator: add password format');
ajv.addFormat('mongoId', mongoIdFormat);
validationDebug('JSON schema validator: add mongoId format');

// Saves all the schemas into our isntance
ajv.addSchema(credentialsSchema, credentialsSchema.title);
validationDebug('JSON schema validator: add credentials schema');
ajv.addSchema(likeSchema, likeSchema.title);
validationDebug('JSON schema validator: add like schema');
ajv.addSchema(sauceSchema, sauceSchema.title).addSchema(sauceRequiredSchema, sauceRequiredSchema.title);
validationDebug('JSON schema validator: add sauces schemas');

export default ajv;
