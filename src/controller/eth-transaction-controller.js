import EthTransactionProcessor from '../processor/eth-transation-processor';
import { ABIValidator, contextMappingResolver, vaildateIdentity } from '../util/resolver-utils';
import { StatusCodes } from 'http-status-codes';
import EthereumService from '../service/eth-service';
import EntityRepository from '../repository/entity-repository';

class EthTransactionHandlerController {

    async createATrasaction(request, response, next) {
        let configurations;
        let address;
        let privateKey;
        let contextMappingParams;

        const contextResponses = Buffer.isBuffer(request.body) ? JSON.parse(request.body.toString()) : request.body;
        if (Object.keys(contextResponses).length === 0) {
            let err = new Error();
            err.status = StatusCodes.FORBIDDEN;
            err.message = 'request body missing';
            return response.status(StatusCodes.FORBIDDEN).jsonp(err);
        }
        EthTransactionProcessor.retrieveConfigs(contextResponses)
            .then((configs) => {
                if (configs.count === 0) {
                    let err = new Error();
                    err.status = StatusCodes.NOT_FOUND;
                    err.message = 'config doesnt exists';
                    return response.status(StatusCodes.NOT_FOUND).jsonp(err);
                }
                // for now supporting only single transaction
                configurations = configs.rows;
                return vaildateIdentity(request);
            })
            .then((identity) => {
                address = identity.address;
                privateKey = identity.privateKey;
                return contextMappingResolver(configurations, contextResponses);
            })
            .then((params) => {
                contextMappingParams = params;
                return ABIValidator(configurations, contextMappingParams);
            })
            .then(() => {
                return this.processTransaction(configurations, contextMappingParams, address, privateKey);
            })
            .then((recipts) => {
                return this.storeRecipts(contextResponses, configurations, recipts);
            })
            .then((txRecipt) => {
                return response.status(StatusCodes.OK).jsonp(txRecipt);
            })
            .catch((error) => {
                return response.status(StatusCodes.FORBIDDEN).jsonp(error);
            })

    }

    processTransaction(configuration, params, address, privateKey) {
        return new Promise((resolve, reject) => {
            configuration.forEach((config) => {
                let ethService = new EthereumService(config);
                // process transaction
                ethService.processTransaction(params, address, privateKey).then((result) => {
                    resolve(result);
                }).catch((error) => {
                    reject(error);
                });
            });           
        });
    }

    storeRecipts(context, configuration, recipts) {
        let txObject = [];
        configuration.forEach((element) => {
            recipts.forEach((recipt) => {
                txObject.push({configId: element.id, txRecipt: recipt});
            })
        })
       return EntityRepository.create({entityId: context.id, txDetails: txObject});
    }

    async readTransactionData() {

    }

    async retryTransaction() {

    }
}

export default new EthTransactionHandlerController();
