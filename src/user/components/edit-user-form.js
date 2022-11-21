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
            idValidator: true, // vreau ca fieldul sa fie required si sa aiba exact 36 de caractere. Alte verificari nu mai fac
                                // pentru ca oricum daca nu exista id-ul, se va returna 404 din backend.
            isRequired: true
        }
    },
    firstName: {
        value: '',
        placeholder: 'What is your first name?...',
        valid: true, // true initial pentru ca admin-ul nu e obligat sa modifice campul pentru a putea edita user-ul.
        touched: false,
        validationRules: {
            editFieldValidator: true // nu voi pune isRequired pentru ca nu oblig admin-ul sa modifice toate campurile user-ului, doar pe cele dorite de el.
        }
    },
    lastName: {
        value: '',
        placeholder: 'What is your last name?...',
        valid: true, // true initial pentru ca admin-ul nu e obligat sa modifice campul pentru a putea edita user-ul.
        touched: false,
        validationRules: {
            editFieldValidator: true // nu voi pune isRequired pentru ca nu oblig admin-ul sa modifice toate campurile user-ului, doar pe cele dorite de el.
        }
    },
    email: {
        value: '',
        placeholder: 'Email...',
        valid: true, // true initial pentru ca admin-ul nu e obligat sa modifice campul pentru a putea edita user-ul.
        touched: false,
        validationRules: {
            editEmailValidator: true // nu voi pune isRequired pentru ca nu oblig admin-ul sa modifice toate campurile user-ului, doar pe cele dorite de el.
        }
    },
    password: {
        value: '',
        placeholder: 'Password...',
        valid: true, // true initial pentru ca admin-ul nu e obligat sa modifice campul pentru a putea edita user-ul.
        touched: false,
        validationRules: {
            editFieldValidator: true // nu voi pune isRequired pentru ca nu oblig admin-ul sa modifice toate campurile user-ului, doar pe cele dorite de el.
        }
    }
};

function EditUserForm(props) {
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

        // console.log("Modified: " + name + "is valid: " + formIsValid);

        setFormControls((formControls) => (updatedControls));
        setFormIsValid((formIsValidPrev) => (formIsValid));
    }


    function editUser(id, user) {
        return API_USERS.editUser(id, user, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("Successfully edited user with id: " + id.id);
                props.reloadHandler();
                setFormControls(formControlsInit);
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function editVerifyNullValue(value) {
        let temporaryValue;
        if(value === ''){
            temporaryValue = null;
        }
        else{
            temporaryValue = value;
        }
        return temporaryValue;
    }

    function handleSubmit() {
        let id = {
            id: formControls.id.value
        };

        let user = {
            firstName: editVerifyNullValue(formControls.firstName.value),
            lastName: editVerifyNullValue(formControls.lastName.value),
            email: editVerifyNullValue(formControls.email.value),
            password: editVerifyNullValue(formControls.password.value)
        };
        console.log(user.firstName + ' ' + user.lastName + ' ' + user.email + ' ' + user.password);
        editUser(id, user);
    }

    // function toggleForm() {
    //     this.setState({collapseForm: !this.state.collapseForm});
    // } //unde o folosesc pe asta? ca nici ei nu o folosesc, numa exista p-acolo in form.

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

            <FormGroup id='firstName'>
                <Label for='firstNameField'> First Name: </Label>
                <Input name='firstName' id='firstNameField' placeholder={formControls.firstName.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.firstName.value}
                       touched={formControls.firstName.touched ? 1 : 0}
                       valid={formControls.firstName.valid}
                />
                {formControls.firstName.touched && !formControls.firstName.valid &&
                <div className={"error-message row"}> * First name must have at least 3 characters </div>}
            </FormGroup>

            <FormGroup id='lastName'>
                <Label for='lastNameField'> Last Name: </Label>
                <Input name='lastName' id='lastNameField' placeholder={formControls.lastName.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.lastName.value}
                       touched={formControls.lastName.touched ? 1 : 0}
                       valid={formControls.lastName.valid}
                />
                {formControls.lastName.touched && !formControls.lastName.valid &&
                <div className={"error-message row"}> * Last name must have at least 3 characters </div>}
            </FormGroup>

            <FormGroup id='email'>
                <Label for='emailField'> Email: </Label>
                <Input name='email' id='emailField' placeholder={formControls.email.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.email.value}
                       touched={formControls.email.touched ? 1 : 0}
                       valid={formControls.email.valid}
                />
                {formControls.email.touched && !formControls.email.valid &&
                <div className={"error-message"}> * Email must have a valid format</div>}
            </FormGroup>

            <FormGroup id='password'>
                <Label for='passwordField'> Password: </Label>
                <Input name='password' id='passwordField' placeholder={formControls.password.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.password.value}
                       touched={formControls.password.touched ? 1 : 0}
                       valid={formControls.password.valid}
                />
                {formControls.password.touched && !formControls.password.valid &&
                <div className={"error-message"}> * Password must have a valid format</div>}
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

export default EditUserForm;
