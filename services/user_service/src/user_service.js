
const { Sequelize, Model, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const express = require('express');
const { Kafka } = require('kafkajs');


(async () => {

    const sequelize = new Sequelize('postgres://alphaone:securityisoverrated@database:5432/alphaone');

    const User = sequelize.define("user", {
        username: DataTypes.TEXT,
        password: DataTypes.TEXT
    });


    const kafka = new Kafka({
        clientId: 'user-service-client',
        brokers: ['kafka:9092']
    })

    const consumer = kafka.consumer({ groupId: 'my-group2'})


    await consumer.connect()
    await consumer.subscribe({ topics: ['users'], fromBeginning: false})


    const app = express();
    const router = express.Router();

    app.use('/', router);
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));

    router.get('/users', async (req, res) => {

        await sequelize.sync();
        
        const users = await User.findAll();


        res.status(200).send(JSON.stringify({users: users}));

    })

    router.post('/users/login', async (req, res) => {
        await sequelize.sync();
        
        console.log(req.params.username);
        const users = await User.findAll({
            where: {
                username: req.body.user,
              }            
        });

        console.log(users)


        res.status(200).send(JSON.stringify({isLogined: users[0][password] == req.body.password}));
    
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
        
                    const user = User.build(body);
                    console.log(user instanceof User); // true
                    console.log(user.username); // "Jane"
                    await user.save();
                    console.log('Entry was saved to the database!');
                    break;

                default:   
                    break;

            }
        },
    })
})();




