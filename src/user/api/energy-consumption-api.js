import { HOST } from '../../commons/hosts';
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    energy: '/energy'
};

function getEnergyConsumptionByDeviceAndDate(params, callback) {
    let request = new Request(HOST.backend_api + endpoint.energy + '/' + params.deviceId, {
        method: 'GET'
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

export {
    getEnergyConsumptionByDeviceAndDate
};
