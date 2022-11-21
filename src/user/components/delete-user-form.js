import React, { useState, useEffect } from 'react';
import { Col, Row } from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import Button from "react-bootstrap/Button";

import Validate from "./validators/user-validators";
import * as API_USERS from "../api/user-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";
import {func} from "prop-types";

const formControlsInit = {
    id: {
        value: '',
        placeholder: 'What is the user\'s id?...',
        valid: false,
        touched: false,
        validationRules: {
            idValidator: true,
            isRequired: true
        }
    }
};

function DeleteUserForm(props) {
    const [error, setError] = useState({ status: 0, errorMessage: null });
    const [formIsValid, setFormIsValid] = useState(false);
    const [formControls, setFormControls] = useState(formControlsInit);

    function handleChange(event) {
        let name = event.target.name;
        let value = event.target.value;

        let updatedControls = { ...formControls };

        let updatedFormElement = updatedControls[name];

        updatedFormElement.value = value;
        updatedFormElement.touched = true;
        updatedFormElement.valid = Validate(value, updatedFormElement.validationRules);
        updatedControls[name] = updatedFormElement;

        let formIsValid = true;
        for (let updatedFormElementName in updatedControls) {
            formIsValid = updatedControls[updatedFormElementName].valid && formIsValid;
        }

        setFormControls((formControls) => (updatedControls));
        setFormIsValid((formIsValidPrev) => (formIsValid));
    }


    function deleteUser(id) {
        return API_USERS.deleteUser(id, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("Successfully deleted user with id: " + id.id);
                props.reloadHandler();
                setFormControls(formControlsInit);
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function handleSubmit() {
        let id = {
            id: formControls.id.value
        };
        deleteUser(id);
    }

    return (
        <div>

            <FormGroup id='id'>
                <Label for='idField'> ID: </Label>
                <Input name='id' id='idField' placeholder={formControls.id.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.id.value}
                       touched={formControls.id.touched ? 1 : 0}
                       valid={formControls.id.valid}
                       required
                />
                {formControls.id.touched && !formControls.id.valid &&
                <div className={"error-message row"}> * ID must have 36 characters </div>}
            </FormGroup>

            <Row>
                <Col sm={{ size: '4', offset: 8 }}>
                    <Button type={"submit"} disabled={!formIsValid} onClick={handleSubmit}>  Submit </Button>
                </Col>
            </Row>

            {
                error.status > 0 &&
                <APIResponseErrorMessage errorStatus={error.status} error={error.errorMessage} />
            }

        </div>
    );
}

export default DeleteUserForm;
