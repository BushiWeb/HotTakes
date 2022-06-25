import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mongoose from 'mongoose';

const app = express();

mongoose
    .connect('mongodb+srv://HotTakesApi:NvCfLecSOV9mByFz@hottakes.8l0ie.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connection successful.'))
    .catch(() => {
        console.error('MongoDB connection failed.');
    });

/* Store the root folder absolute path in the app.
 * Since we are using ES modules, __dirname is unavailable.
 * by storing it in the app, all middleware will have access to its value.
 */
app.set('root', path.dirname(fileURLToPath(import.meta.url)));

app.use(express.json());

// CORS Headers settings
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Static routes
app.use('/images', express.static(path.join(app.get('root'), '../images')));

export default app;
