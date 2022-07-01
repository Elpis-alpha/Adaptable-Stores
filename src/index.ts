// Import Statements
import './middleware/init';

import './db/mongoose';

import hbs from 'hbs';

import path from 'path';

import express, { Express } from 'express';

import chalk from 'chalk';

import cors from 'cors';

import delay from './middleware/delay';

import userRouter from './routers/user';

import _404Router from './routers/404';

import normalRouter from './routers/normal';

import taskRouter from './routers/task';


// Acquire an instance of Express
const app: Express = express();


// Acquires the port on which the application runs
const port = process.env.PORT


// Reterieves the application production status
const isProduction = process.env.IS_PRODUCTION === 'true'


// Obtain the public path
const publicPath = path.join(__dirname, '../public')


// Obtain the views path
const viewsPath = path.join(__dirname, '../template/views')


// Obtain the partials path
const partialsPath = path.join(__dirname, '../template/partials')


// Sets the view engine to HBS
app.set('view engine', 'hbs')


// Automatically serve view hbs files
app.set('views', viewsPath)


// Automatically serve partials as hbs files
hbs.registerPartials(partialsPath)


// Automatically serve public (static) files
app.use(express.static(publicPath))


// Automatically parse incoming requests and 20mb limit
app.use(express.json({ limit: "20mb" }))


// Automatically parse form body and encodes
app.use(express.urlencoded({ extended: true }))


// Automatically allow incomming incoming cors
app.use(cors())


// One second delay for local development
if (!isProduction) { app.use(delay) }


// Automatically allows user routers
app.use(userRouter)


// Automatically allows normal routes
app.use(normalRouter)


// Automatically allows task routes
app.use(taskRouter)


// Automatically allows 404 routes
app.use(_404Router)


// Listening Server
app.listen(port, () => {

  console.log(chalk.hex('#009e00')(`Server started successfully on port ${port}`));

  console.log(chalk.cyanBright(`Server time: ${new Date().toLocaleString()}`));

})
