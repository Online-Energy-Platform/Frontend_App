import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';

import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import UserForm from "./components/user-form";
import EditUserForm from "./components/edit-user-form";
import DeleteUserForm from "./components/delete-user-form";
import * as API_USERS from "./api/user-api";
import UserTable from "./components/user-table";
import { withRouter } from "react-router-dom";

function UserContainer(props) {

    const [isSelected, setIsSelected] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false); // folosit pentru a face reload la tabela -> true daca s-a
    // apasat un buton de submit sau daca s-a inchis/deschis modala;

    const [editIsSelected, setEditIsSelected] = useState(false); // folosit pentru a deschide/inchide modala
    // de edit la apasarea butonului "Edit User";

    const [deleteIsSelected, setDeleteIsSelected] = useState(false); // folosit pentru a deschide/inchide modala
    // de delete la apasarea butonului "Delete User";

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
    }, []);

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
            </Card>

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
