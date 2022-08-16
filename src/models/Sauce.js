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
             * @param {string} userId - Id of the user reseting it's decision.
             * @returns {number} Returns 1 if a like has been reset, -1 if a dislike has been reset and 0 if nothing has been reset.
             */
            resetLiking(userId) {
                mongooseCustomMethodDebug(`Sauce instance method resetLiking(${userId})`);

                // Remove the user's dislike if the user disliked the sauce
                const userDislikeIndex = this.usersDisliked.indexOf(userId);
                if (userDislikeIndex >= 0) {
                    this.usersDisliked.splice(userDislikeIndex, 1);
                    this.dislikes--;
                    return -1;
                }

                // Remove the user's like if the user liked the sauce
                const userLikeIndex = this.usersLiked.indexOf(userId);
                if (userLikeIndex >= 0) {
                    this.usersLiked.splice(userLikeIndex, 1);
                    this.likes--;
                    return 1;
                }

                return 0;
            },

            /**
             * Like, dislike or reset the like of the sauce instance. Reset first to make sure the user can't do the same action multiple times, or can't like and dislike at the same time.
             * @param {number} likeType - Number representing the type of liking: 0 to reset, 1 to like and -1 to dislike.
             * @param {string} userId - Id of the user liking the sauce.
             * @returns {{reset: number, action: number}} Returns an object describing the actions that has been done. The reset parameter describes if anything has been reset, and the action parameter describe if the user liked (1), disliked (-1) or did nothing but reset (0).
             */
            setLiking(likeType, userId) {
                mongooseCustomMethodDebug(`Sauce instance method setLiking(${likeType}, ${userId})`);

                // Reset previous choice
                const resultObject = { reset: this.resetLiking(userId), action: likeType };

                // Apply the like or dislike
                switch (likeType) {
                    case 1:
                        this.like(userId);
                        break;
                    case -1:
                        this.dislike(userId);
                        break;
                }

                return resultObject;
            },
        },
    }
);

export default mongoose.model('Sauce', sauceSchema);
