import { passwordErrorMessage } from './custom-formats.js';

/**
 * Credentials schema to validate authentication requests' body.
 * Contains:
 *      - A required string email
 *      - A required string strong password
 */
const credentialsSchema = {
    $id: 'https://hottakes.com/credentials.schema.json',
    title: 'credentials',
    description: 'Authentication credentials schema',
    type: 'object',
    additionalProperties: false,
    required: ['email', 'password'],
    properties: {
        email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            errorMessage: 'The email property must be a string containing a valid email',
        },
        password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            errorMessage: `The password property ${passwordErrorMessage}`,
        },
    },
    errorMessage: {
        type: 'The payload must be a JSON object',
        required: {
            email: 'The payload must contain the user email',
            password: 'The payload must contain a strong password',
        },
    },
};

export default credentialsSchema;
