/**
 * Sauce schema to validate update requests' body.
 * Contains:
 *      - The name, manufacturer, description and main pepper as optionnal strings
 *      - The heat, as an optionnal integer between 1 and 10
 */
export const sauceSchema = {
    $id: 'https://hottakes.com/sauce.schema.json',
    title: 'sauce',
    description: 'Sauce schema',
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
            maxLength: 255,
            description: "Sauce's name",
            errorMessage: 'The name property must be a string with at most 255 characters',
        },
        manufacturer: {
            type: 'string',
            maxLength: 255,
            description: "Sauce's manufacturer",
            errorMessage: 'The manufacturer property must be a string with at most 255 characters',
        },
        description: {
            type: 'string',
            description: "Sauce's description",
            errorMessage: 'The description property must be a string',
        },
        mainPepper: {
            type: 'string',
            maxLength: 255,
            description: "Sauce's main pepper",
            errorMessage: 'The mainPepper property must be a string with at most 255 characters',
        },
        heat: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            description: "Sauce's intensity",
            errorMessage: 'The heat property must be an integer between 1 and 10',
        },
    },
    errorMessage: {
        type: 'The payload must be a JSON object',
    },
};

/**
 * Sauce schema to validate insertion requests' body.
 * Extends the sauce schema for updates by making all properties required.
 * @see sauceSchema
 */
export const sauceRequiredSchema = {
    $id: 'https://hottakes.com/sauce.required.schema.json',
    title: 'sauceRequired',
    description: 'Sauce schema with all fields required',
    $ref: '/sauce.schema.json',
    required: ['name', 'manufacturer', 'description', 'mainPepper', 'heat'],
    errorMessage: {
        required: {
            name: "The payload must contain the sauce's name",
            manufacturer: "The payload must contain the sauce's manufacturer",
            description: "The payload must contain the sauce's description",
            mainPepper: "The payload must contain the sauce's main pepper",
            heat: "The payload must contain the sauce's intensity",
        },
    },
};
