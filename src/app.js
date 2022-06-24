import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = express();

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
