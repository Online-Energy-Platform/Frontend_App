import { HOST } from '../../commons/hosts';
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    name: '/chat'
};

function postMessage(message, callback) {
    let request = new Request(HOST.backend_api + endpoint.name, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });

    console.log("URL: " + request.url);
    RestApiClient.performRequest(request, callback);
}

function postNotification(message, callback) {
    let request = new Request(HOST.backend_api + endpoint.name + "/sendNotification", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });

    console.log("URL: " + request.url);
    RestApiClient.performRequest(request, callback);
}

export {
    postMessage,
    postNotification
};
