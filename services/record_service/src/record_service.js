
const { Sequelize, Model, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const express = require('express');
const { Kafka } = require('kafkajs');


(async () => {

    const sequelize = new Sequelize('postgres://alphaone:securityisoverrated@database:5432/alphaone');

    const Record = sequelize.define("record", {
        recordID: DataTypes.INTEGER,
        username: DataTypes.TEXT,
        header: DataTypes.TEXT,
        body: DataTypes.TEXT
    });


    const kafka = new Kafka({
        clientId: 'record-service-client',
        brokers: ['kafka:9092']
    })

    const producer = kafka.producer();
    const consumer = kafka.consumer({ groupId: 'my-group1'})


    await producer.connect()
    await consumer.connect()
    await consumer.subscribe({ topics: ['records'], fromBeginning: false})


    const app = express();
    const router = express.Router();

    app.use('/', router);
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    router.get('/records', async (req, res) => {

        await sequelize.sync();
        
        const records = await Record.findAll();


        res.status(200).send(JSON.stringify({records: records}));

    })

    router.get('/records/:username', async (req, res) => {
        await sequelize.sync();
        
        console.log(req.params.username);
        const records = await Record.findAll({
            where: {
                username: req.params.username,
              }            
        });


        res.status(200).send(JSON.stringify({records: records}));
    
      });

    app.listen(3000);

    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
            console.log('Message received:', message.value.toString());
            var body = JSON.parse(message.value.toString());
        
            switch(body.req)
            {
                case "POST":
                    await sequelize.sync();
        
                    const entry = Record.build(body);
                    console.log(entry instanceof Record); // true
                    console.log(entry.username); // "Jane"
                    await entry.save();
                    console.log('Entry was saved to the database!');
                    break;

                case "PUT":
                    await Record.update(
                        body,
                        {
                          where: { recordID: body.record_id },
                        }
                      );
                    break;                
            
                case "DELETE":
                    await Record.destroy({
                        where: { recordID:  body.record_id},
                      });
                    break;

                default:   
                    break;

            }
        },
    })
})();




