// const _ = require('underscore');
const cors = require('cors')
const bodyParser = require('body-parser');
const express = require('express');
const kafka = require('kafka-node');
// const { Client: PgClient } = require('pg');
// const type = require('./type');

// const pgClient = new PgClient();
// pgClient.connect();

const kafkaClientOptions = { sessionTimeout: 100, spinDelay: 100, retries: 2 };
const kafkaClient = new kafka.Client(process.env.KAFKA_ZOOKEEPER_CONNECT, 'producer-client', kafkaClientOptions);
const kafkaProducer = new kafka.HighLevelProducer(kafkaClient);

kafkaClient.on('error', (error) => console.error('Kafka client error:', error));
kafkaProducer.on('error', (error) => console.error('Kafka producer error:', error));


const app = express();
const router = express.Router();

app.use(cors())
app.use('/', router);
router.use(cors())
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// router.post('/sales', (req, res) => {
//   const { total } = req.body;
//   const parsedTotal = Number(total);

//   console.log("this is request");


//   if (_.isNaN(parsedTotal)) {
//     res.status(400);
//     res.json({ error: 'Ensure total is a valid NumbeR.' });
//     return;
//   }
//   const messageBuffer = type.toBuffer({
//     total: parsedTotal,
//     saleDate: Date.now()
//   });

//   const payload = [{
//     topic: 'sales-topic',
//     messages: messageBuffer,
//     attributes: 1
//   }];

//   kafkaProducer.send(payload, function(error, result) {
//     console.info('Sent payload to Kafka:', payload);

//     if (error) {
//       console.error('Sending payload failed:', error);
//       res.status(500).json(error);
//     } else {
//       console.log('Sending payload result:', result);
//       res.status(202).json(result);
//     }
//   });
// });

// router.get('/sales', async (req, res) => {
//   const { rows } = await pgClient.query('SELECT id, uuid, total, sale_date, created_at FROM sales');
//   res.status(200).json(rows);
// });

router.get('/records', (req, res) => {
  console.log(req.body);
  res.status(200).send("NewTimes");
})

router.post('/records', (req, res) => {
  console.log(req.body);

  // const messageBuffer = type.toBuffer({
  //   total: parsedTotal,
  //   saleDate: Date.now()
  // });

  const payload = [{
    topic: 'records',
    messages: JSON.stringify(req.body),
    attributes: 1
  }];

  kafkaProducer.send(payload, function(error, result) {
    console.info('Sent payload to Kafka:', payload);

    if (error) {
      console.error('Sending payload failed:', error);
      res.status(500).json(error);
    } else {
      console.log('Sending payload result:', result);
      res.status(202).json(result);
    }
  });

  res.status(200);
})

app.listen(process.env.GATEWAY_PORT);