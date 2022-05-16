
const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const { Kafka } = require('kafkajs');



(async () => {

  const instanceR = axios.create({
    baseURL: 'http://record_service:3000'
  });

  const instanceU = axios.create({
    baseURL: 'http://user_service:3000'
  });

  const kafka = new Kafka({
    clientId: 'gateway-client',
    brokers: ['kafka:9092']
  })

  const producer = kafka.producer()
  await producer.connect();

  const app = express();
  const router = express.Router();

  app.use('/', router);
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));


  // Records code: 
  router.get('/records', async (req, res) => {
    console.log(req.body);
    var ret = await instanceR.get('/records').then((res) => res.data);
    res.status(200).send(JSON.stringify(ret));

  });

  router.get('/records/:username', async (req, res) => {
    console.log(req.body);
    var ret = await instanceR.get('/records/' + req.params.username).then((res) => res.data);
    res.status(200).send(JSON.stringify(ret));

  });

  router.post('/records', async (req, res) => {
    console.log(req.body);

    const payload = {
        topic: 'records',
        messages: [{value: JSON.stringify({...req.body, req: "POST"})}],
      };

    await producer.send(payload);

    res.status(200).send("Success");
  });


  router.put('/records/:record_id', async (req, res) => {
    console.log(req.body);

    const payload = {
        topic: 'records',
        messages: [{value: JSON.stringify({...req.body, req: "PUT", record_id: req.params.record_id})}],
      };

    await producer.send(payload);

    res.status(200).send("Success");
  });


  router.delete('/records/:record_id', async (req, res) => {
    console.log(req.body);

    const payload = {
        topic: 'records',
        messages: [{value: JSON.stringify({record_id: req.params.record_id, req: "DELETE"})}],
      };

    await producer.send(payload);

    res.status(200).send("Success");
  });


  // Users code: 

  router.get('/users', async (req, res) => {
    console.log(req.body);
    var ret = await instanceU.get('/users').then((res) => res.data);
    res.status(200).send(JSON.stringify(ret));

  });

  router.post('/users/login', async (req, res) => {
    console.log(req.body);
    var ret = await instanceU.post('/users/login', {
      user: req.body.user,
      password: req.body.password
    }).then((res) => res.data);
    res.status(200).send(JSON.stringify(ret));

  });

  router.post('/users', async (req, res) => {
    console.log(req.body);

    const payload = {
        topic: 'users',
        messages: [{value: JSON.stringify({...req.body, req: "POST"})}],
      };

    await producer.send(payload);

    res.status(200).send("Success");
  });

  app.listen(process.env.GATEWAY_PORT);
})();