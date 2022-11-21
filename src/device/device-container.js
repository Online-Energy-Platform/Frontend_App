import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';

import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import DeviceForm from "./components/device-form";
import EditDeviceForm from "./components/edit-device-form";
import DeleteDeviceForm from "./components/delete-device-form";
import * as API_DEVICES from "./api/device-api";
import DeviceTable from "./components/device-table";
import { withRouter } from "react-router-dom";

function DeviceContainer(props) {
    const [isSelected, setIsSelected] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [editIsSelected, setEditIsSelected] = useState(false); // pentru form-ul de update -> open/close.

    const [deleteIsSelected, setDeleteIsSelected] = useState(false); // pentru form-ul de delete -> open/close.

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
        fetchDevices();
    }, []);

    function fetchDevices() {
        return API_DEVICES.getDevices((result, status, err) => {
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
        fetchDevices();
    }

    function reloadEdit() {
        setIsLoaded((isLoaded) => (false));

        toggleEditForm();
        fetchDevices();
    }

    function reloadDelete() {
        setIsLoaded((isLoaded) => (false));

        toggleDeleteForm();
        fetchDevices();
    }

    return (
        <div>
            <CardHeader>
                <strong> Devices Management </strong>
            </CardHeader>
            <Card>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <Button color="primary" onClick={toggleForm}>Add Device </Button>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        {isLoaded && <DeviceTable tableData={tableData} />}
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
                        <Button color="primary" onClick={toggleEditForm}>Edit Device </Button>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <Button color="primary" onClick={toggleDeleteForm}>Delete Device </Button>
                    </Col>
                </Row>
                <br />
            </Card>

            <Modal isOpen={isSelected} toggle={toggleForm} size="lg">
                <ModalHeader toggle={toggleForm}> Add Device: </ModalHeader>
                <ModalBody>
                    <DeviceForm reloadHandler={reload} />
                </ModalBody>
            </Modal>

            <Modal isOpen={editIsSelected} toggle={toggleEditForm} size="lg">
                <ModalHeader toggle={toggleEditForm}> Edit Device: </ModalHeader>
                <ModalBody>
                    <EditDeviceForm reloadHandler={reloadEdit} />
                </ModalBody>
            </Modal>

            <Modal isOpen={deleteIsSelected} toggle={toggleDeleteForm} size="lg">
                <ModalHeader toggle={toggleDeleteForm}> Delete Device: </ModalHeader>
                <ModalBody>
                    <DeleteDeviceForm reloadHandler={reloadDelete} />
                </ModalBody>
            </Modal>

        </div>
    );

}

export default withRouter(DeviceContainer);
