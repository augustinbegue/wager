import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import routers from './routes';
import cors from 'cors';

export const app = express();

const getActualRequestDurationInMilliseconds = (start: any) => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};


function demoLogger(req: any, res: any, next: any) {
    let current_datetime = new Date();
    let formatted_date =
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    let method = req.method;
    let url = req.url;
    let status = res.statusCode;
    const start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms - ${req.ip}`;
    console.log(log);

    next();
};

// Middlewaresnpm i --save-dev @types/corsnpm i --save-dev @types/cors
app.use(demoLogger);
app.use(cors());

app.use('/matches', routers.matchesRouter);
app.use('/competitions', routers.competitionsRouter);

// Static Assets
app.use('/static', express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => {
    res.redirect('https://wager.ga');
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Listening on port 3000");
});