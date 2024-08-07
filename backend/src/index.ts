import express from 'express';
import userRouter from './routes/user';
import workerRouter from './routes/worker';
require('dotenv').config();     //  This is the secret that we will use to sign the JWT token       
const app = express();

app.use(express.json());

app.use('/v1/user', userRouter)
app.use('v1/worker', workerRouter)

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})