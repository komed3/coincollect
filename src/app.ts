import express from 'express';
import { apiRoutes } from './routes/APIRoutes';

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use( express.urlencoded( { limit: '50mb', extended: true } ) );
app.use( express.json( { limit: '50mb' } ) );

// Routes
app.use( '/api', apiRoutes );

app.listen( PORT );
