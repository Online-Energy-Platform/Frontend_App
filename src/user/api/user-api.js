import { HOST } from '../../commons/hosts';
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    user: '/user'
};

function getUsers(callback) {
    let request = new Request(HOST.backend_api + endpoint.user, {
        method: 'GET',
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function getUserById(params, callback) {
    let request = new Request(HOST.backend_api + endpoint.user + '/' + params.id, {
        method: 'GET'
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postUser(user, callback) {
    let request = new Request(HOST.backend_api + endpoint.user, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    console.log("URL: " + request.url);

    RestApiClient.performRequest(request, callback);
}

function editUser(params, user, callback) {
    let request = new Request(HOST.backend_api + endpoint.user + '/' + params.id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function deleteUser(params, callback) {
    let request = new Request(HOST.backend_api + endpoint.user + '/' + params.id, {
        method: 'DELETE'
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function loginUser(params, user, callback) {
    let request = new Request(HOST.backend_api + endpoint.user + '/' + params.email, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

export {
    getUsers,
    getUserById,
    postUser,
    editUser,
    deleteUser,
    loginUser
};
