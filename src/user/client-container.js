import React, { useState, useEffect } from 'react';
import {Button, Card, CardHeader, Col, Input, Label, Modal, ModalBody, ModalHeader, Row} from 'reactstrap';

import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import * as API_USERS from "./api/user-api";
import * as API_DEVICES from "../device/api/device-api";
import DeviceTable from "../device/components/device-table";
import { withRouter } from "react-router-dom";
import ViewDeviceConsumptionForm from "./components/view-device-consumption-form";
import DeleteUserForm from "./components/delete-user-form";
import SockJsClient from 'react-stomp';
import {HOST} from "../commons/hosts";
import {forEach} from "react-bootstrap/ElementChildren";

let initialClient = {
    id: '',
    fullName: '',
    email: '',
    role: ''
}

let initialNotification = {
    messageBody: 'No notifications yet!',
    deviceId: ''
}

function ClientContainer(props) {

    const [isSelected, setIsSelected] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [clientData, setClientData] = useState(initialClient);

    // Store error status and message in the same object because we don't want
    // to render the component twice (using setError and setErrorStatus)
    // This approach can be used for linked state variables.
    const [error, setError] = useState({ status: 0, errorMessage: null });
    const [notification, setNotification] = useState(initialNotification);

    // componentDidMount
    useEffect(() => {
        let currentUser = JSON.parse(localStorage.getItem('user'));
        if(currentUser == null){
            props.history.push("/");
        }
        else{
            console.log(currentUser.role);
            if(currentUser.role === "ADMIN"){
                props.history.push("/");
            }
            else{
                fetchDevices();
                fetchUser();
            }
        }
    }, []);

    function fetchDevices() { //trebuie sa fac filter -> sa iau doar device-urile userului meu.
        return API_DEVICES.getDevices((result, status, err) => {
            if (result !== null && status === 200) {
                let loggedUserId = JSON.parse(localStorage.getItem('user')).id;
                let devicesList = [];
                result.forEach(device => {
                   if (device.userId === loggedUserId) {
                       devicesList.push(device);
                   }
                });
                setTableData((tableData) => (devicesList));
                setIsLoaded((isLoaded) => (true)); // de ce functioneaza tabelul doar daca am isLoaded? Nu
                // pot intelege. Desi aparent tableData are datele si fara isLoaded, doar ca sunt object si de aia se
                // printeaza [].
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function fetchUser() {
        let loggedUserId = JSON.parse(localStorage.getItem('user')).id;
        let id = {
            id: loggedUserId
        }
        return API_USERS.getUserById(id,(result, status, err) => {
            if (result !== null && status === 200) {
                setClientData((clientData) => (result));
                // console.log("Din get user(1): " + clientData.email); //se printeaza inainte sa se faca update-ul cu set
                // din ceva motiv, dar merge afisarea.
                // console.log("Din get user(2): " + result.id);
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function toggleForm() {
        setIsSelected((isSelected) => (!isSelected));
    }

    function reload() {
        setIsLoaded((isLoaded) => (false));

        toggleForm();
        fetchDevices();
        fetchUser();
    }

    function whenConnected() {
        console.log("Connected to socket!");
    }
    function whenDisconnected() {
        console.log("Disconnected from the socket!");
    }
    function whenReceivedNotification(sentNotification) {
        let ownsDevice = false;
        tableData.forEach(deviceTuple => {
            if(deviceTuple.id === sentNotification.deviceId){
                console.log(deviceTuple);
                ownsDevice = true;
            }
        })
        if(ownsDevice){
            setNotification(sentNotification);
            console.log("Received notification: " + sentNotification.messageBody +
                ", pentru device-ul: " + sentNotification.deviceId);
        }
    }

    return (
        <div>
            <CardHeader>
                <strong> Client Page </strong>
            </CardHeader>
            <Card>
                <br/>
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <CardHeader>
                            <strong> Notifications </strong>
                        </CardHeader>
                        <Card>
                            <div>
                                <SockJsClient
                                    url={HOST.backend_api + "/notificationServer"}
                                    topics={['/energyConsumptionSimulation/message']}
                                    onConnect={whenConnected()}
                                    onDisconnect={whenDisconnected()}
                                    onMessage={sentNotification => whenReceivedNotification(sentNotification)}
                                    debug={false}
                                />
                                <div>{notification.messageBody}</div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <CardHeader>
                            <strong> Client Details </strong>
                        </CardHeader>
                        <Card>
                            <Label for='idField'> Client ID: </Label>
                            <Input name='idName' id='idField' placeholder={clientData.id}
                                   type="text" disabled
                            />
                            <Label for='fullNameField'> Full Name: </Label>
                            <Input name='fullNameName' id='fullNameField' placeholder={clientData.fullName}
                                   type="text" disabled
                            />
                            <Label for='emailField'> Email: </Label>
                            <Input name='emailName' id='emailField' placeholder={clientData.email}
                                   type="text" disabled
                            />
                            <Label for='roleField'> Role: </Label>
                            <Input name='roleName' id='roleField' placeholder={clientData.role}
                                   type="text" disabled
                            />
                        </Card>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <CardHeader>
                            <strong> User's devices </strong>
                        </CardHeader>
                        <Card>
                            {isLoaded && <DeviceTable tableData={tableData} />}
                            {error.status > 0 &&
                            <APIResponseErrorMessage
                                errorStatus={error.status}
                                error={error.errorMessage}
                            />}
                        </Card>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <Button color="primary" onClick={toggleForm}>View consumption </Button>
                    </Col>
                </Row>
                <br />
            </Card>

            <Modal isOpen={isSelected} toggle={toggleForm} size="lg">
                <ModalHeader toggle={toggleForm}> View device consumption: </ModalHeader>
                <ModalBody>
                    <ViewDeviceConsumptionForm reloadHandler={reload} />
                </ModalBody>
            </Modal>

        </div>
    );

}

export default withRouter(ClientContainer);
