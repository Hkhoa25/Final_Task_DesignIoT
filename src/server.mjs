// 1. Initialize
import express from 'express';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { getEnvs } from './envs.mjs';
const ENV = getEnvs();
const app = express();
console.log(ENV.INFLUX.HOST);
// 1.2 Initialize DB connection
const DB_CLIENT = new InfluxDB({
    url: ENV.INFLUX.HOST,
    token: ENV.INFLUX.TOKEN
});
const DB_WRITE_POINT = DB_CLIENT.getWriteApi(
    ENV.INFLUX.ORG,
    ENV.INFLUX.BUCKET
);
DB_WRITE_POINT.useDefaultTags({ app: 'db_api' });
// Endpoint - embed
app.get('/api/v1/', (_, res) => res.sendStatus(200));
app.get('/api/v1/embed', async (req, res) => {
    try {
        const value = req.query.value;
        const numeric_value = parseFloat(value);
        const point = new Point("qparams");
        point.floatField("value", numeric_value);
        DB_WRITE_POINT.writePoint(point); // starts transaction
        await DB_WRITE_POINT.flush(); // end the transaction => save
        res.send(`Value: '${value}' written.`);
    } catch(err) {
        console.error(err);
        // console.log({ db: ENV.INFLUX.HOST });
        res.sendStatus(500);
    }
});
// Enpoints - base
app.get('', (_, res) => res.send('OK'));
// Enpoints - test query params
app.get('/test', (req, res) => {
    console.log(req.query);
    res.send('received queryparams!');
});
// Enpoints - API V1
// Enpoints - Write data point to InfluxDB
// 2. Operate
app.listen(ENV.PORT, ENV.HOST, () => {
    console.log(`Listening http://${ENV.HOST}:${ENV.PORT}`);
    // 3. Cleanup
    // http_server.close();
});

export default app;
