require('dotenv').config()

const { Modem } = require('serialport-gsm');
const mqtt = require('mqtt');

const modem = Modem();
let mqttClient = null;

async function initModem() {
    try {
        await modem.open(process.env.MODEM_PATH, {
            baudRate: 9600,
            pin: process.env.MODEM_PIN,
            dataBits: 8,
            stopBits: 1,
            autoDeleteOnReceive: true,
            logger: process.env.DEBUG === 'true' ? console : null
        })

        await modem.initializeModem()

        await modem.setModemMode(undefined, 'PDU');

        modem.on('onNewMessage', (data) => {
            console.info('New message received', data)
        })

        console.info('Modem is ready')
    } catch (error) {
        console.error('Modem connection error')
    }
}

async function initMqtt() {
    try {
        mqttClient = await mqtt.connectAsync({ host: process.env.MQTT_HOST, port: process.env.MQTT_PORT, username: process.env.MQTT_USER, password: process.env.MQTT_PASSWORD });

        console.info('MQTT is ready')
    } catch (error) {
        console.error('MQTT connection error')
    }
}

async function getInboxSms() {
    const { data } = await modem.getSimInbox();
    data.forEach(message => {
        publishSMS(message);
    });
    await modem.deleteAllSimMessages();
}

function healthz() {
    return new Promise((resolve) => {
        modem.checkModem((res, error) => {
            return resolve(!error && res?.status === 'success')
        })
        setTimeout(() => {
            return resolve(false)
        }, 1000);
    })
}

function sendSMS(to, message, count = 0) {
    return new Promise(async (resolve, reject) => {
        if(count > 3) return reject('Max retry')
        if (!(await healthz())) {
            console.error('Modem is not healthy')
            return sendSMS(to, message, count + 1)
        }
        modem.sendSMS(to, message, false, (res, err) => {
            if (err || res?.status !== 'success') {
                mqttClient.publish('gsm/sms/send/error', JSON.stringify({ to, message, error: err }));
                console.error('Error sending SMS')
            }
            return resolve(res)
        })
    })
}

async function publishSMS(data) {
    mqttClient.publish('gsm/sms/receive', JSON.stringify(data));
}

async function createListener() {
    await initModem();
    await initMqtt();

    await getInboxSms();

    modem.on('onNewMessage', (data) => {
        console.info('New message received')
        data.forEach(message => {
            publishSMS(message);
        });
    });

    mqttClient.subscribe('gsm/sms/send');

    mqttClient.on('message', async (topic, data) => {
        if (topic !== 'gsm/sms/send') return;
        const { to, message } = JSON.parse(data.toString());
        if (!to || !message) return;
        await sendSMS(to, message);
    });
}

createListener();