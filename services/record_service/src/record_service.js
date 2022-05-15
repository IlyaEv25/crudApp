const { Sequelize, Model, DataTypes } = require('sequelize');
const kafka = require('kafka-node');

// Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize('alphaone', 'alphaone', 'securityisoverrated', {
//   host: '192.168.1.104:8000',
//   dialect: 'postgres'
// });
const sequelize = new Sequelize('postgres://alphaone:securityisoverrated@database:5432/alphaone');

const Record = sequelize.define("record", {
    recordID: DataTypes.INTEGER,
    username: DataTypes.TEXT,
    header: DataTypes.TEXT,
    body: DataTypes.TEXT
  });

const kafkaClientOptions = { sessionTimeout: 100, spinDelay: 100, retries: 2 };
const kafkaClient = new kafka.Client(process.env.KAFKA_ZOOKEEPER_CONNECT, 'consumer-client', kafkaClientOptions);

const topics = [
    { topic: 'records' }
];

const options = {
    autoCommit: true,
    fetchMaxWaitMs: 1000,
    fetchMaxBytes: 1024 * 1024
};

const kafkaConsumer = new kafka.HighLevelConsumer(kafkaClient, topics, options);

kafkaConsumer.on('message', async function(message) {
    console.log('Message received:', message);

    await sequelize.sync();

    const entry = Record.build(JSON.parse(message.value));
    console.log(entry instanceof Record); // true
    console.log(entry.username); // "Jane"
    await entry.save();
    console.log('Entry was saved to the database!');
});

kafkaClient.on('error', (error) => console.error('Kafka client error:', error));
kafkaConsumer.on('error', (error) => console.error('Kafka consumer error:', error));


async function check()
{
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
  
//   (async () => {

//     await sequelize.sync();
//     const jane = User.build({ name: "Jane", favoriteColor: "green" });
//     console.log(jane instanceof User); // true
//     console.log(jane.name); // "Jane"
//     await jane.save();
//     console.log('Jane was saved to the database!');



//     // Code here
//   })();
  
  

//check();
  
  

