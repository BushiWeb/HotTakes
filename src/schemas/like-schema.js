/**
 * Like schema to validate like requests' body.
 * Contains:
 *      - A required string userId, with MongoDB Id format
 *      - A required integer like, between -1 and 1
 */
const likeSchema = {
    $id: 'https://hottakes.com/like.schema.json',
    title: 'like',
    description: 'Like request body schema',
    type: 'object',
    additionalProperties: false,
    required: ['like', 'userId'],
    properties: {
        like: {
            type: 'integer',
            description: 'Like value, 1 for a like, 0 to reset the choice and -1 for a dislike',
            maximum: 1,
            minimum: -1,
            errorMessage:
                'The like property must be an integer between -1 and 1. If like equals 1, then the sauce will be liked. If like equals -1, then the sauce will be disliked. If like equals 0, then your previous action is reset',
        },
        userId: {
            type: 'string',
            format: 'mongoId',
            description: 'User id',
            errorMessage: 'The userId must be a string containing a valid MongoDB ID.',
        },
    },
    errorMessage: {
        type: 'The payload must be a JSON object',
        required: {
            like: 'The payload must contain the like value',
            userId: 'The payload must contain the user id',
        },
    },
};

export default likeSchema;
