import React, {useState, useEffect, useRef} from 'react';
import {Button, Card, CardHeader, Col, Input, Label, Modal, ModalBody, ModalHeader, Row} from 'reactstrap';

import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import * as API_USERS from "./api/user-api";
import * as API_CHAT from "./api/chat-api";
import * as API_DEVICES from "../device/api/device-api";
import DeviceTable from "../device/components/device-table";
import { withRouter } from "react-router-dom";
import ViewDeviceConsumptionForm from "./components/view-device-consumption-form";
import SockJsClient from 'react-stomp';
import {HOST} from "../commons/hosts";
import ReadIcon from "../commons/images/read-message-icon.jpg";
import TypingIcon from "../commons/images/typing-icon.jpg";

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

let messageForAdmin = {
    senderID: "",
    senderFullName: "",
    receiverID: "42ffc0b3-66d4-4958-ad17-299a5322dcc1",
    messageBody: "message"
}

function ClientContainer(props) {

    const [isSelected, setIsSelected] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [clientData, setClientData] = useState(initialClient);

    /* FOR ENERGY NOTIFICATIONS: */
    const [notification, setNotification] = useState(initialNotification);
    /* END */

    /* FOR THE CHAT: */
    // contine mesajul scris in input de catre client:
    const [sentMsg, setSentMsg] = useState('');
    // contine lista de mesaje inglobate intr-un input tag:
    const [displayedMess, setDisplayedMess] = useState([]);
    // dto-ul cu mesajul pe care il vom trimite:
    const [msgToSend, setMsgToSend] = useState(messageForAdmin);
    // variabila care sa afiseze sau nu imaginea pentru seen in functie de notificarea primita:
    const [seenOrNot, setSeenOrNot] = useState("hidden");
    // variabila in care trimitem mesajul de notificare: seen sau typing:
    const [chatNotification, setChatNotification] = useState(messageForAdmin);
    // variabila care ne spune daca avem mesaje trimise care inca nu au fost vazute:
    const [unseenMsg, setUnseenMsg] = useState(false);
    // variabila care afiseaza sau nu imaginea pentru typing:
    const [typingOrNot, setTypingOrNot] = useState("hidden");
    // variabila cu ajutorul careia trimitem notificare de typing doar odata cat timp user-ul scrie in input box:
    const [sendTypingNotif, setSendTypingNotif] = useState(true);
    // variabila care ajutorul careia facem scroll la finalul div-ului pentru a vedea ultimele mesaje din chat:
    const endOfMessages = useRef(null);
    /* END */

    // Store error status and message in the same object because we don't want
    // to render the component twice (using setError and setErrorStatus)
    // This approach can be used for linked state variables.
    const [error, setError] = useState({ status: 0, errorMessage: null });

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
        endOfMessages.current.scroll({ top: endOfMessages.current.scrollHeight });
    }, [displayedMess]);

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

    /* FOR THE CHAT: */
    function sendMessage(message) {
        return API_CHAT.postMessage(message,(result, status, err) => {
            if (result !== null && status === 200) {
                console.log("Mesajul a fost trimis cu succes!!!");
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function handleChange(event){
        setSentMsg(event.target.value); // setam variabila noastra la valoarea din input text field;
        if(sendTypingNotif === true){
            sendTypingNotification();
            setSendTypingNotif(false);
        }
    }

    // cand stergem continutul input-ului si de-focusam input-ul atunci celuilalt user nu ii va mai aparea "typing":
    function handleBlur(){
        if((sendTypingNotif === false) && (sentMsg === '')){
            console.log("Intra aici!");
            sendNotTypingNotification();
            setSendTypingNotif(true);
        }
    }

    function sendMessageToAgent(){
        if(!(sentMsg === '')){
            // display message:
            setDisplayedMess(allMessages => [...allMessages, <Input key={allMessages.length} value={"You:\n"
                                                                    + sentMsg + '\n(' + new Date().toLocaleString() + ')'}
                                                                    style={{backgroundColor: '#800080', color: '#FFFFFF'
                                                                        , gridColumn: '1', gridRow: allMessages.length+1
                                                                        , height: 'fit-content'}}
                                                                    type="textarea" disabled />]);

            // send message to admin:
            msgToSend.messageBody = sentMsg;
            msgToSend.senderID = JSON.parse(localStorage.getItem('user')).id;
            msgToSend.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
            console.log(msgToSend.senderFullName);
            sendMessage(msgToSend);

            // am trimis mesaj care nu a fost inca citit de admin:
            setUnseenMsg(true);

            // setam si sa nu mai apara icon-ul de seen:
            setSeenOrNot("hidden");

            // resetam variabila pentru trimiterea notificarii de typing:
            setSendTypingNotif(true);

            // reset input:
            setSentMsg('');
        }
    }

    function receiveMessageFromAdmin(receivedMessage){
        if(receivedMessage.receiverID === JSON.parse(localStorage.getItem('user')).id){
            setDisplayedMess(allMessages => [...allMessages, <Input key={allMessages.length}
                                                                    value={receivedMessage.senderFullName + ' (ADMIN):\n'
                                                                    + receivedMessage.messageBody + '\n('
                                                                    + new Date().toLocaleString() + ')'}
                                                                    style={{backgroundColor: '#008000', color: '#FFFFFF'
                                                                        , gridColumn: '2', gridRow: allMessages.length+1
                                                                        , height: 'fit-content'}}
                                                                    type="textarea" disabled />]);
            setTypingOrNot("hidden");
        }
    }
    /* END */

    /* PENTRU NOTIFICARILE DIN CHAT: */
    function receiveNotificationFromAdmin(receivedNotification){
        if((receivedNotification.receiverID === JSON.parse(localStorage.getItem('user')).id)
            && (receivedNotification.messageBody === "SEEN") && (unseenMsg === true)){
            setSeenOrNot("visible");
            setUnseenMsg(false);
        }
        if((receivedNotification.receiverID === JSON.parse(localStorage.getItem('user')).id)
            && (receivedNotification.messageBody === "TYPING")){
            setTypingOrNot("visible");
        }
        if((receivedNotification.receiverID === JSON.parse(localStorage.getItem('user')).id)
            && (receivedNotification.messageBody === "NOT TYPING")){
            setTypingOrNot("hidden");
        }
    }

    function sendNotification(message) {
        return API_CHAT.postNotification(message,(result, status, err) => {
            if (result !== null && status === 200) {
                console.log("Notificarea a fost trimisa cu succes!!!");
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function sendSeenNotification(){
        chatNotification.messageBody = "SEEN";
        chatNotification.senderID = JSON.parse(localStorage.getItem('user')).id;
        chatNotification.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
        sendNotification(chatNotification);
    }

    function sendTypingNotification(){
        chatNotification.messageBody = "TYPING";
        chatNotification.senderID = JSON.parse(localStorage.getItem('user')).id;
        chatNotification.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
        sendNotification(chatNotification);
    }

    function sendNotTypingNotification(){
        chatNotification.messageBody = "NOT TYPING";
        chatNotification.senderID = JSON.parse(localStorage.getItem('user')).id;
        chatNotification.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
        sendNotification(chatNotification);
    }
    /* END */

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
                <br/>

                {/*FOR THE CHAT: */}
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <CardHeader>
                            <strong> Chat with an agent </strong>
                        </CardHeader>
                        <Card>
                            <Row>
                                <Col sm={{ size: '8', offset: 1 }}>
                                    <br/>
                                    <div style={{overflowY: 'scroll', minHeight: '30vh', maxHeight: '30vh', display: 'grid'
                                        , gridTemplateColumns: '1fr 1fr'}} ref={endOfMessages}>
                                        {displayedMess}
                                    </div>
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col sm={{ size: '8', offset: 1 }}>
                                    <Input name='msg' id='msg' placeholder={"Write your message"}
                                           value={sentMsg}
                                           onChange={handleChange}
                                           onBlur={handleBlur}
                                           onClick={sendSeenNotification}
                                    />
                                </Col>
                                <Col sm={{ offset: 1 }}>
                                    <Button type={"submit"} color="primary" onClick={sendMessageToAgent} >Send </Button>
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col sm={{ size: '8', offset: 1 }}>
                                    <Input name="seen" id="seen" value={"Admin seen notification: "} disabled />
                                </Col>
                                <Col sm={{ offset: 1 }}>
                                    <img src={ReadIcon} width={"35"} height={"35"} style={{backgroundColor: '#FFFFFF'
                                        , border: 'solid #555', visibility: seenOrNot}} />
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col sm={{ size: '8', offset: 1 }}>
                                    <Input name="seen" id="seen" value={"Admin typing: "} disabled />
                                </Col>
                                <Col sm={{ offset: 1 }}>
                                    <img src={TypingIcon} width={"35"} height={"35"} style={{backgroundColor: '#FFFFFF'
                                        , border: 'solid #555', visibility: typingOrNot}} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <br/>
                {/* END */}

            </Card>

            {/* PENTRU MESAJE PE CHAT: */}
            <SockJsClient
                url={HOST.backend_api + "/chatServer"}
                topics={['/chat/message']}
                onConnect={whenConnected()}
                onDisconnect={whenDisconnected()}
                onMessage={receivedMessage => receiveMessageFromAdmin(receivedMessage)}
                debug={false}
            />
            {/* END */}

            {/* PENTRU NOTIFICARI PE CHAT: */}
            <SockJsClient
                url={HOST.backend_api + "/chatNotificationsServer"}
                topics={['/chatNotifications/message']}
                onConnect={whenConnected()}
                onDisconnect={whenDisconnected()}
                onMessage={receivedNotification => receiveNotificationFromAdmin(receivedNotification)}
                debug={false}
            />
            {/* END */}

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
