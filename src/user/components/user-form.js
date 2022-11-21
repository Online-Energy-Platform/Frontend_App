import React, { useState, useEffect } from 'react';
import { Col, Row } from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import Button from "react-bootstrap/Button";

import Validate from "./validators/user-validators";
import * as API_USERS from "../api/user-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";

const formControlsInit = {
    firstName: {
        value: '',
        placeholder: 'What is your first name?...',
        valid: false,
        touched: false,
        validationRules: {
            minLength: 3,
            isRequired: true
        }
    },
    lastName: {
        value: '',
        placeholder: 'What is your last name?...',
        valid: false,
        touched: false,
        validationRules: {
            minLength: 3,
            isRequired: true
        }
    },
    email: {
        value: '',
        placeholder: 'Email...',
        valid: false,
        touched: false,
        validationRules: {
            emailValidator: true
        }
    },
    password: {
        value: '',
        placeholder: 'Password...',
        valid: false,
        touched: false,
        validationRules: {
            minLength: 3,
            isRequired: true
        }
    },
    confirmPassword: {
        value: '',
        placeholder: 'Confirm Password...',
        valid: false,
        touched: false,
        validationRules: {
            minLength: 3,
            isRequired: true
        }
    },
    role: {
        value: '',
        placeholder: 'Role...',
        valid: false,
        touched: false,
    }
};

function UserForm(props) {
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


    function registerUser(user) {
        return API_USERS.postUser(user, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("Successfully inserted user with id: " + result);
                props.reloadHandler();
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function handleSubmit() {
        let user = {
            firstName: formControls.firstName.value,
            lastName: formControls.lastName.value,
            email: formControls.email.value,
            password: formControls.password.value,
            confirmPassword: formControls.confirmPassword.value,
            role: formControls.role.value,
        };
        registerUser(user);
    }

    return (
        <div>

            <FormGroup id='firstName'>
                <Label for='firstNameField'> First Name: </Label>
                <Input name='firstName' id='firstNameField' placeholder={formControls.firstName.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.firstName.value}
                       touched={formControls.firstName.touched ? 1 : 0}
                       valid={formControls.firstName.valid}
                       required
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
                    required
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
                    required
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
                       required
                />
                {formControls.password.touched && !formControls.password.valid &&
                <div className={"error-message"}> * Password must have a valid format</div>}
            </FormGroup>

            <FormGroup id='confirmPassword'>
                <Label for='confirmPasswordField'> Confirm Password: </Label>
                <Input name='confirmPassword' id='confirmPasswordField' placeholder={formControls.confirmPassword.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.confirmPassword.value}
                       touched={formControls.confirmPassword.touched ? 1 : 0}
                       valid={formControls.confirmPassword.valid}
                       required
                />
                {formControls.confirmPassword.touched && !formControls.confirmPassword.valid &&
                <div className={"error-message"}> * Email must have a valid format</div>}
            </FormGroup>

            <FormGroup id='role'>
                <Label for='roleField'> Role: </Label>
                <Input name='role' id='roleField' placeholder={formControls.role.placeholder}
                    onChange={handleChange}
                    defaultValue={formControls.role.value}
                    touched={formControls.role.touched ? 1 : 0}
                    valid={formControls.role.valid}
                    required
                />
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

export default UserForm;
