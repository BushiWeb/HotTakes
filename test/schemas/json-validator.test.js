import ajv from '../../src/schemas/json-validator.js';
import credentialsSchema from '../../src/schemas/credentials-schema.js';
import likeSchema from '../../src/schemas/like-schema.js';
import { sauceRequiredSchema, sauceSchema } from '../../src/schemas/sauce-schema.js';

describe('Schemas test suite', () => {
    describe('Credentials schema test suite', () => {
        let validObject = {
            email: 'test@example.com',
            password: 'P@55word',
        };
        let validate = ajv.getSchema(credentialsSchema.title);

        test('The object is valid', () => {
            expect(validate(validObject)).toBe(true);
        });

        test('The object is not an object', () => {
            const invalidObject = [{ ...validObject }];
            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors[0]).toHaveProperty('message', credentialsSchema.errorMessage.type);
        });

        test('The object is missing the required properties', () => {
            const invalidObject = {};

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(2);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.params.errors[0].params.missingProperty.match(/email/)) {
                    errorMessage = credentialsSchema.errorMessage.required.email;
                }
                if (error.params.errors[0].params.missingProperty.match(/password/)) {
                    errorMessage = credentialsSchema.errorMessage.required.password;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't have the right type", () => {
            const invalidObject = { ...validObject };
            invalidObject.email = invalidObject.password = true;

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(2);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.instancePath.match(/email/)) {
                    errorMessage = credentialsSchema.properties.email.errorMessage;
                }
                if (error.instancePath.match(/password/)) {
                    errorMessage = credentialsSchema.properties.password.errorMessage;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't respect their formats", () => {
            const invalidObject = { ...validObject };
            invalidObject.email = 'test';
            invalidObject.password = 'test';

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(2);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.instancePath.match(/email/)) {
                    errorMessage = credentialsSchema.properties.email.errorMessage;
                }
                if (error.instancePath.match(/password/)) {
                    errorMessage = credentialsSchema.properties.password.errorMessage;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });
    });

    describe('Like schema test suite', () => {
        let validObject = {
            like: 1,
            userId: '507f1f77bcf86cd799439011',
        };
        let validate = ajv.getSchema(likeSchema.title);

        test('The object is valid', () => {
            expect(validate(validObject)).toBe(true);
        });

        test('The object is not an object', () => {
            const invalidObject = [{ ...validObject }];
            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors[0]).toHaveProperty('message', likeSchema.errorMessage.type);
        });

        test('The object is missing the required properties', () => {
            const invalidObject = {};

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(2);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.params.errors[0].params.missingProperty.match(/like/)) {
                    errorMessage = likeSchema.errorMessage.required.like;
                }
                if (error.params.errors[0].params.missingProperty.match(/userId/)) {
                    errorMessage = likeSchema.errorMessage.required.userId;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't have the right type", () => {
            const invalidObject = { ...validObject };
            invalidObject.userId = invalidObject.like = true;

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(2);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.instancePath.match(/like/)) {
                    errorMessage = likeSchema.properties.like.errorMessage;
                }
                if (error.instancePath.match(/userId/)) {
                    errorMessage = likeSchema.properties.userId.errorMessage;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't respect their formats", () => {
            const invalidObject = { ...validObject };
            invalidObject.like = 3;
            invalidObject.userId = '123';

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(2);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.instancePath.match(/like/)) {
                    errorMessage = likeSchema.properties.like.errorMessage;
                }
                if (error.instancePath.match(/userId/)) {
                    errorMessage = likeSchema.properties.userId.errorMessage;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });
    });

    describe('Sauce schema test suite', () => {
        let validObject = {
            name: 'name',
            manufacturer: 'manufacturer',
            description: 'lorem ipsum dolor sit amet',
            mainPepper: 'Hot pepper',
            heat: 5,
        };
        let validate = ajv.getSchema(sauceSchema.title);

        test('The object is valid', () => {
            expect(validate(validObject)).toBe(true);
        });

        test('The object is not an object', () => {
            const invalidObject = [{ ...validObject }];
            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors[0]).toHaveProperty('message', sauceSchema.errorMessage.type);
        });

        test("The object properties don't have the right type", () => {
            const invalidObject = { ...validObject };
            invalidObject.name =
                invalidObject.manufacturer =
                invalidObject.description =
                invalidObject.mainPepper =
                invalidObject.heat =
                    true;

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(5);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.instancePath.match(/name/)) {
                    errorMessage = sauceSchema.properties.name.errorMessage;
                }
                if (error.instancePath.match(/manufacturer/)) {
                    errorMessage = sauceSchema.properties.manufacturer.errorMessage;
                }
                if (error.instancePath.match(/description/)) {
                    errorMessage = sauceSchema.properties.description.errorMessage;
                }
                if (error.instancePath.match(/mainPepper/)) {
                    errorMessage = sauceSchema.properties.mainPepper.errorMessage;
                }
                if (error.instancePath.match(/heat/)) {
                    errorMessage = sauceSchema.properties.heat.errorMessage;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't respect their formats", () => {
            const invalidObject = { ...validObject };
            invalidObject.heat = 13;

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors[0]).toHaveProperty('message', sauceSchema.properties.heat.errorMessage);
        });
    });

    describe('Sauce required schema, referencing sauce schema, test suite', () => {
        let validObject = {
            name: 'name',
            manufacturer: 'manufacturer',
            description: 'lorem ipsum dolor sit amet',
            mainPepper: 'Hot pepper',
            heat: 5,
        };
        let validate = ajv.getSchema(sauceRequiredSchema.title);

        test('The object is valid', () => {
            expect(validate(validObject)).toBe(true);
        });

        test('The object is not an object', () => {
            const invalidObject = [{ ...validObject }];
            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors[0]).toHaveProperty('message', sauceSchema.errorMessage.type);
        });

        test('The object is missing the required properties', () => {
            const invalidObject = {};

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(5);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.params.errors[0].params.missingProperty.match(/name/)) {
                    errorMessage = sauceRequiredSchema.errorMessage.required.name;
                }
                if (error.params.errors[0].params.missingProperty.match(/manufacturer/)) {
                    errorMessage = sauceRequiredSchema.errorMessage.required.manufacturer;
                }
                if (error.params.errors[0].params.missingProperty.match(/description/)) {
                    errorMessage = sauceRequiredSchema.errorMessage.required.description;
                }
                if (error.params.errors[0].params.missingProperty.match(/mainPepper/)) {
                    errorMessage = sauceRequiredSchema.errorMessage.required.mainPepper;
                }
                if (error.params.errors[0].params.missingProperty.match(/heat/)) {
                    errorMessage = sauceRequiredSchema.errorMessage.required.heat;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't have the right type", () => {
            const invalidObject = { ...validObject };
            invalidObject.name =
                invalidObject.manufacturer =
                invalidObject.description =
                invalidObject.mainPepper =
                invalidObject.heat =
                    true;

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(5);
            for (const error of validate.errors) {
                let errorMessage;
                if (error.instancePath.match(/name/)) {
                    errorMessage = sauceSchema.properties.name.errorMessage;
                }
                if (error.instancePath.match(/manufacturer/)) {
                    errorMessage = sauceSchema.properties.manufacturer.errorMessage;
                }
                if (error.instancePath.match(/description/)) {
                    errorMessage = sauceSchema.properties.description.errorMessage;
                }
                if (error.instancePath.match(/mainPepper/)) {
                    errorMessage = sauceSchema.properties.mainPepper.errorMessage;
                }
                if (error.instancePath.match(/heat/)) {
                    errorMessage = sauceSchema.properties.heat.errorMessage;
                }
                expect(error).toHaveProperty('message', errorMessage);
            }
        });

        test("The object properties don't respect their formats", () => {
            const invalidObject = { ...validObject };
            invalidObject.heat = 13;

            expect(validate(invalidObject)).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors[0]).toHaveProperty('message', sauceSchema.properties.heat.errorMessage);
        });
    });
});
