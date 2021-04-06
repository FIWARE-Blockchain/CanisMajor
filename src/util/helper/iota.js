import Mam from '@iota/mam';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';
import { CONSTANTS } from '../../configuration/config';
let mamState = Mam.init(CONSTANTS.ETHEREUM_CONFIG.IOTAMaMConfig.host);
Mam.changeMode(mamState, CONSTANTS.ETHEREUM_CONFIG.IOTAMaMConfig.mode);

const publishToIOTA = (payload) => {
    return new Promise((resolve, reject) => {
        let data = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
        const trytes = asciiToTrytes(data);
        const message = Mam.create(mamState, trytes);
        mamState = message.state;
        // Attach the message to the Tangle
        Mam.attach(message.payload, message.address, 3, 9).then((res) => {
            resolve(message.root);
        }).catch((err) => {
            reject(err);
        });
    });
};

const getFromIOTA = (root) => {
    return new Promise((resolve, reject) => {
        Mam.fetch(root, CONSTANTS.ETHEREUM_CONFIG.IOTAMaMConfig.mode).then((res) => {
            res.messages.forEach(message => {
                console.log(trytesToAscii(message));
                let data = Buffer.from(trytesToAscii(message), 'base64').toString('utf-8');
                resolve(JSON.parse(data));
            });
        }).catch((err) => {
            reject(err);
        });
    });
};

export { publishToIOTA, getFromIOTA }