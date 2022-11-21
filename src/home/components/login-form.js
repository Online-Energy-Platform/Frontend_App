import React, { useState, useEffect } from 'react';
import { Col, Row } from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import Button from "react-bootstrap/Button";

import Validate from "../../user/components/validators/user-validators";
import * as API_USERS from "../../user/api/user-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";
import { withRouter } from "react-router-dom";

const formControlsInit = {
    email: {
        value: '',
        placeholder: 'Ex: nume@domeniu.com...',
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
    }
};

function LoginForm(props) {
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

    function loginUser(email, user) {
        console.log("POST STARTS!");
        return API_USERS.loginUser(email, user, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("(FROM POST)Successfully logged in user with id: " + result.id);
                localStorage.setItem('user', JSON.stringify(result));
                console.log("(FROM POST)User role: " + JSON.parse(localStorage.getItem('user')).role);
                if(localStorage.getItem('user') != null) {
                    let role = JSON.parse(localStorage.getItem('user')).role;
                    console.log(role);
                    if(role === "ADMIN"){
                        props.history.push("/user"); // PENTRU REDIRECT LA PAGINA DE ADMIN(VIEW USERS);
                    }
                    else if(role === "CLIENT"){
                        props.history.push("/client");
                    }
                }

            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function handleSubmit() {
        let email = {
            email: formControls.email.value
        }

        let user = {
            password: formControls.password.value
        };

        loginUser(email, user);
    }

    return (
        <div>

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

            <Row>
                <Col sm={{ size: '8', offset: 0 }}>
                    <Button type={"submit"} disabled={!formIsValid} onClick={handleSubmit}>  Log in </Button>
                </Col>
            </Row>

            {
                error.status > 0 &&
                <APIResponseErrorMessage errorStatus={error.status} error={error.errorMessage} />
            }
        </div>
    );
}

export default withRouter(LoginForm);
