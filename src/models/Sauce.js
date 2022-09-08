import mongoose from 'mongoose';
import { createDebugNamespace } from '../logger/logger.js';

const mongooseCustomMethodDebug = createDebugNamespace('mongoose:customMethod');

const sauceSchema = mongoose.Schema(
    {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        manufacturer: { type: String, required: true },
        description: { type: String, required: true },
        mainPepper: { type: String, required: true },
        imageUrl: { type: String, required: true },
        heat: { type: Number, required: true, min: 1, max: 10 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        usersLiked: { type: [String], default: [] },
        usersDisliked: { type: [String], default: [] },
    },
    {
        methods: {
            /**
             * Like the sauce instance.
             * @param {string} userId - Id of the user liking the sauce.
             */
            like(userId) {
                mongooseCustomMethodDebug(`Sauce instance method like(${userId})`);
                this.likes++;
                this.usersLiked.push(userId);
            },

            /**
             * Dislike the sauce instance.
             * @param {string} userId - Id of the user disliking the sauce.
             */
            dislike(userId) {
                mongooseCustomMethodDebug(`Sauce instance method dislike(${userId})`);
                this.dislikes++;
                this.usersDisliked.push(userId);
            },

            /**
             * Reset the liking of the sauce instance for a user.
             * @param {number} likeType - Type of like to reset (0 for nothing, 1 for like, -1 for dislike)
             * @param {number} userArrayIndex - Index of the user in the array corresponding to the like to reset
             */
            resetLiking(likeType, userArrayIndex) {
                mongooseCustomMethodDebug(`Sauce instance method resetLiking(${likeType}, ${userArrayIndex})`);

                if (likeType === 0) return;

                // Remove the user from the array
                let arrayToUse = likeType === 1 ? this.usersLiked : this.usersDisliked;
                arrayToUse.splice(userArrayIndex, 1);

                // Decrement the counter
                if (likeType === 1) {
                    this.likes--;
                } else {
                    this.dislikes--;
                }
            },

            /**
             * Finds if the user liked or disliked the sauce.
             * @param {string} userId - Id of the user reseting it's decision.
             * @returns {{action:number, index:number}} Returns an object containing the action the user has done (1 for like, -1 for dislike and 0 for nothing) and it's index in the corresponding array.
             */
            findUserLike(userId) {
                mongooseCustomMethodDebug(`Sauce instance method findUserLike(${userId})`);

                let returnObject = {
                    action: 0,
                    index: -1,
                };

                // Search the user in the dislike array
                returnObject.index = this.usersDisliked.indexOf(userId);
                if (returnObject.index >= 0) {
                    returnObject.action = -1;
                    return returnObject;
                }

                // Remove the user's like if the user liked the sauce
                returnObject.index = this.usersLiked.indexOf(userId);
                if (returnObject.index >= 0) {
                    returnObject.action = 1;
                    return returnObject;
                }

                return returnObject;
            },

            /**
             * Like, dislike or reset the like of the sauce instance. Reset first to make sure the user can't do the same action multiple times, or can't like and dislike at the same time.
             * @param {number} likeType - Number representing the type of liking: 0 to reset, 1 to like and -1 to dislike.
             * @param {string} userId - Id of the user liking the sauce.
             * @returns {{previousAction: number, newAction: number}} Returns an object describing the changes that has been done: what was the previous action done by the user (-1, 1 or 0) and what is the new action (-1, 1, or 0).
             */
            setLiking(likeType, userId) {
                mongooseCustomMethodDebug(`Sauce instance method setLiking(${likeType}, ${userId})`);

                // Find the user
                const { action: previousAction, index: actionIndex } = this.findUserLike(userId);

                // Create the return object
                const resultObject = { previousAction, newAction: likeType };

                // Apply the like or dislike
                switch (likeType) {
                    case 1:
                        if (previousAction === 1) break;
                        if (previousAction === -1) {
                            this.resetLiking(previousAction, actionIndex);
                        }
                        this.like(userId);
                        break;
                    case -1:
                        if (previousAction === -1) break;
                        if (previousAction === 1) {
                            this.resetLiking(previousAction, actionIndex);
                        }
                        this.dislike(userId);
                        break;
                    default:
                        this.resetLiking(previousAction, actionIndex);
                }

                return resultObject;
            },
        },
    }
);

export default mongoose.model('Sauce', sauceSchema);
