import React, {useState, useEffect, useRef} from 'react';
import {Button, Card, CardHeader, Col, Input, Modal, ModalBody, ModalHeader, Row} from 'reactstrap';

import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import UserForm from "./components/user-form";
import EditUserForm from "./components/edit-user-form";
import DeleteUserForm from "./components/delete-user-form";
import * as API_USERS from "./api/user-api";
import UserTable from "./components/user-table";
import { withRouter } from "react-router-dom";
import SockJsClient from "react-stomp";
import {HOST} from "../commons/hosts";
import * as API_CHAT from "./api/chat-api";
import ReadIcon from "../commons/images/read-message-icon.jpg";
import TypingIcon from "../commons/images/typing-icon.jpg";

let messageForClient = {
    senderID: "42ffc0b3-66d4-4958-ad17-299a5322dcc1",
    senderFullName: "",
    receiverID: "",
    messageBody: "message"
}

function UserContainer(props) {

    const [isSelected, setIsSelected] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false); // folosit pentru a face reload la tabela -> true daca s-a
    // apasat un buton de submit sau daca s-a inchis/deschis modala;

    const [editIsSelected, setEditIsSelected] = useState(false); // folosit pentru a deschide/inchide modala
    // de edit la apasarea butonului "Edit User";

    const [deleteIsSelected, setDeleteIsSelected] = useState(false); // folosit pentru a deschide/inchide modala
    // de delete la apasarea butonului "Delete User";

    /* FOR CHAT: */
    const [showChat, setShowChat] = useState(false);
    const [displayedMess, setDisplayedMess] = useState([]);
    const [msg, setMsg] = useState('');
    const [msgToSend, setMsgToSend] = useState(messageForClient);
    const [seenOrNot, setSeenOrNot] = useState("hidden");
    const [notification, setNotification] = useState(messageForClient);
    const [unseenMsg, setUnseenMsg] = useState(false);
    const [typingOrNot, setTypingOrNot] = useState("hidden");
    const [sendTypingNotif, setSendTypingNotif] = useState(true);
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
            if(currentUser.role === "CLIENT"){
                props.history.push("/");
            }
        }
        fetchUsers();
        if(showChat === true){
            endOfMessages.current.scroll({ top: endOfMessages.current.scrollHeight });
        }
    }, [displayedMess]);

    function fetchUsers() {
        return API_USERS.getUsers((result, status, err) => {
            if (result !== null && status === 200) {
                setTableData((tableData) => (result));
                setIsLoaded((isLoaded) => (true));
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function toggleForm() {
        setIsSelected((isSelected) => (!isSelected));
    }

    function toggleEditForm() {
        setEditIsSelected((editIsSelected) => (!editIsSelected));
    }

    function toggleDeleteForm() {
        setDeleteIsSelected((deleteIsSelected) => (!deleteIsSelected));
    }

    function reload() {
        setIsLoaded((isLoaded) => (false));

        toggleForm();
        fetchUsers();
    }

    function reloadEdit() {
        setIsLoaded((isLoaded) => (false));

        toggleEditForm();
        fetchUsers();
    }

    function reloadDelete() {
        setIsLoaded((isLoaded) => (false));

        toggleDeleteForm();
        fetchUsers();
    }

    /* FOR CHAT: */
    function handleChange(event){
        setMsg(event.target.value);
        if(sendTypingNotif === true){
            sendTypingNotification();
            setSendTypingNotif(false);
        }
    }

    function handleBlur(){
        if((sendTypingNotif === false) && (msg === '')){
            console.log("Intra aici!");
            sendNotTypingNotification();
            setSendTypingNotif(true);
        }
    }

    function whenConnected() {
        console.log("Connected to socket!");
    }

    function whenDisconnected() {
        console.log("Disconnected from the socket!");
    }

    function whenReceivedMessage(receivedMessage) {
        setShowChat(true);
        if(receivedMessage.receiverID === JSON.parse(localStorage.getItem('user')).id){
            setDisplayedMess(allMessages => [...allMessages, <Input key={allMessages.length}
                                                                    value={receivedMessage.senderFullName + ' ('
                                                                    + receivedMessage.senderID + '):\n'
                                                                    + receivedMessage.messageBody + '\n('
                                                                    + new Date().toLocaleString() + ')'}
                                                                    style={{backgroundColor: '#008000', color: '#FFFFFF'
                                                                        , gridColumn: '1', gridRow: allMessages.length+1
                                                                        , height: 'fit-content'}}
                                                                    type="textarea" disabled />]);
            msgToSend.receiverID = receivedMessage.senderID;
            setTypingOrNot("hidden");
        }
    }

    function sendMessage(message) {
        return API_CHAT.postMessage(message,(result, status, err) => {
            if (result !== null && status === 200) {
                console.log("Mesajul a fost trimis cu succes!!!");
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function sendMessageToClient(){
        if((showChat === true) && !(msg === '')){
            setDisplayedMess(allMessages => [...allMessages, <Input key={allMessages.length} value={'You:\n' + msg
                                                                    + '\n(' + new Date().toLocaleString() + ')'}
                                                                    style={{backgroundColor: '#800080', color: '#FFFFFF'
                                                                        , gridColumn: '2', gridRow: allMessages.length+1
                                                                        , height: 'fit-content'}}
                                                                    type="textarea" disabled />]);
            // send message to admin:
            msgToSend.messageBody = msg;
            msgToSend.senderID = JSON.parse(localStorage.getItem('user')).id;
            msgToSend.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
            sendMessage(msgToSend);

            // avem mesaj trimis catre client care nu a fost vazut inca:
            setUnseenMsg(true);

            // setam si sa nu mai apara icon-ul de seen:
            setSeenOrNot("hidden");

            // resetam variabila pentru trimiterea notificarii de typing:
            setSendTypingNotif(true);

            // reset input:
            setMsg('');
        }
    }
    /* END */

    /* PENTRU NOTIFICARI PE CHAT: */
    function receiveNotificationFromClient(receivedNotification){
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
        notification.messageBody = "SEEN";
        notification.senderID = JSON.parse(localStorage.getItem('user')).id;
        notification.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
        sendNotification(notification);
    }

    function sendTypingNotification(){
        notification.messageBody = "TYPING";
        notification.senderID = JSON.parse(localStorage.getItem('user')).id;
        notification.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
        sendNotification(notification);
    }

    function sendNotTypingNotification(){
        notification.messageBody = "NOT TYPING";
        notification.senderID = JSON.parse(localStorage.getItem('user')).id;
        notification.senderFullName = JSON.parse(localStorage.getItem('user')).fullName;
        sendNotification(notification);
    }
    /* END */

    return (
        <div>
            <CardHeader>
                <strong> Users Management </strong>
            </CardHeader>
            <Card>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <Button color="primary" onClick={toggleForm}>Add User </Button>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        {isLoaded && <UserTable tableData={tableData} />}
                        {error.status > 0 &&
                            <APIResponseErrorMessage
                                errorStatus={error.status}
                                error={error.errorMessage}
                            />}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <Button color="primary" onClick={toggleEditForm}>Edit User </Button>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <Button color="primary" onClick={toggleDeleteForm}>Delete User </Button>
                    </Col>
                </Row>
                <br />

                {/*FOR THE CHAT: */}
                {showChat && <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <CardHeader>
                            <strong> Chat with a client </strong>
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
                                           value={msg}
                                           onChange={handleChange}
                                           onBlur={handleBlur}
                                           onClick={sendSeenNotification}
                                    />
                                </Col>
                                <Col sm={{ offset: 1 }}>
                                    <Button type={"submit"} color="primary" onClick={sendMessageToClient} >Send </Button>
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col sm={{ size: '8', offset: 1 }}>
                                    <Input name="seen" id="seen" value={"Client seen notification: "} disabled />
                                </Col>
                                <Col sm={{ offset: 1 }}>
                                    <img src={ReadIcon} width={"35"} height={"35"} style={{backgroundColor: '#FFFFFF'
                                        , border: 'solid #555', visibility: seenOrNot}} />
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col sm={{ size: '8', offset: 1 }}>
                                    <Input name="seen" id="seen" value={"Client typing: "} disabled />
                                </Col>
                                <Col sm={{ offset: 1 }}>
                                    <img src={TypingIcon} width={"35"} height={"35"} style={{backgroundColor: '#FFFFFF'
                                        , border: 'solid #555', visibility: typingOrNot}} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>}
                <br/>
                {/* END */}

            </Card>

            {/* PENTRU CHAT */}
            <SockJsClient
                url={HOST.backend_api + "/chatServer"}
                topics={['/chat/message']}
                onConnect={whenConnected()}
                onDisconnect={whenDisconnected()}
                onMessage={receivedMessage => whenReceivedMessage(receivedMessage)}
                debug={false}
            />
            {/* END */}

            {/* PENTRU NOTIFICARI PE CHAT: */}
            <SockJsClient
                url={HOST.backend_api + "/chatNotificationsServer"}
                topics={['/chatNotifications/message']}
                onConnect={whenConnected()}
                onDisconnect={whenDisconnected()}
                onMessage={receivedNotification => receiveNotificationFromClient(receivedNotification)}
                debug={false}
            />
            {/* END */}

            <Modal isOpen={isSelected} toggle={toggleForm} size="lg">
                <ModalHeader toggle={toggleForm}> Add User: </ModalHeader>
                <ModalBody>
                    <UserForm reloadHandler={reload} />
                </ModalBody>
            </Modal>

            <Modal isOpen={editIsSelected} toggle={toggleEditForm} size="lg">
                <ModalHeader toggle={toggleEditForm}> Edit User: </ModalHeader>
                <ModalBody>
                    <EditUserForm reloadHandler={reloadEdit} />
                </ModalBody>
            </Modal>

            <Modal isOpen={deleteIsSelected} toggle={toggleDeleteForm} size="lg">
                <ModalHeader toggle={toggleDeleteForm}> Delete User: </ModalHeader>
                <ModalBody>
                    <DeleteUserForm reloadHandler={reloadDelete} />
                </ModalBody>
            </Modal>

        </div>
    );

}

export default withRouter(UserContainer);
