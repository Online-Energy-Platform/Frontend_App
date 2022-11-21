import React, { useState, useEffect } from 'react';
import { Col, Row } from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import Button from "react-bootstrap/Button";

import Validate from "./validators/device-validators";
import * as API_DEVICES from "../api/device-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";

const formControlsInit = {
    id: {
        value: '',
        placeholder: 'What is the device\'s id?...',
        valid: false,
        touched: false,
        validationRules: {
            idValidator: true,
            isRequired: true
        }
    },
    description: {
        value: '',
        placeholder: 'What is the device\'s description?...',
        valid: true,
        touched: false,
        validationRules: {
            editFieldValidator: true
        }
    },
    address: {
        value: '',
        placeholder: 'Cluj-Napoca, Str. Plopilor, Nr. 14, Bl. B2, Ap. 16...',
        valid: true,
        touched: false,
        validationRules: {
            editAddressValidator: true
        }
    },
    maxHEnergyConsumption: {
        value: '',
        placeholder: 'What is the device\'s max energy consumption? Ex: 400...',
        valid: true,
        touched: false,
        validationRules: {
            editEnergyValidator: true
        }
    },
    userId: {
        value: '',
        placeholder: 'Which user owns the device?...',
        valid: true,
        touched: false,
        validationRules: {
            editUserIdValidator: true
        }
    }
};

function EditDeviceForm(props) {
    const [error, setError] = useState({ status: 0, errorMessage: null });
    const [formIsValid, setFormIsValid] = useState(false);
    const [formControls, setFormControls] = useState(formControlsInit);

    function handleChange(event) {
        let name = event.target.name;
        let value = event.target.value;

        let updatedControls = { ...formControls };

        let updatedFormElement = updatedControls[name];

        console.log(updatedFormElement);
        console.log(updatedControls[name]);

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


    function editDevice(id, device) {
        return API_DEVICES.editDevice(id, device, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("Successfully updated device with id: " + id.id);
                props.reloadHandler();
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
        let device = {
            description: editVerifyNullValue(formControls.description.value),
            address: editVerifyNullValue(formControls.address.value),
            maxHEnergyConsumption: editVerifyNullValue(formControls.maxHEnergyConsumption.value),
            userId: editVerifyNullValue(formControls.userId.value)
        };
        editDevice(id, device);
    }

    return (
        <div>

            <FormGroup id="id">
                <Label for='idField'> ID: </Label>
                <Input name='id' id='idField'
                       onChange={handleChange}
                       defaultValue={formControls.id.value}
                       touched={formControls.id.touched ? 1 : 0}
                       valid={formControls.id.valid}
                       required
                />
                {formControls.id.touched && !formControls.id.valid &&
                <div className={"error-message row"}> * Id must have 36 characters </div>}
            </FormGroup>

            <FormGroup id='description'>
                <Label for='descriptionField'> Description: </Label>
                <Input name='description' id='descriptionField'
                       onChange={handleChange}
                       defaultValue={formControls.description.value}
                       touched={formControls.description.touched ? 1 : 0}
                       valid={formControls.description.valid}
                />
                {formControls.description.touched && !formControls.description.valid &&
                <div className={"error-message row"}> * Description must have at least 3 characters </div>}
            </FormGroup>

            <FormGroup id='address'>
                <Label for='addressField'> Address: </Label>
                <Input name='address' id='addressField'
                       onChange={handleChange}
                       defaultValue={formControls.address.value}
                       touched={formControls.address.touched ? 1 : 0}
                       valid={formControls.address.valid}
                />
                {formControls.address.touched && !formControls.address.valid &&
                <div className={"error-message row"}> * Address must have a valid format </div>}
            </FormGroup>

            <FormGroup id='maxHEnergyConsumption'>
                <Label for='maxHEnergyConsumptionField'> Max Hourly Energy Consumption: </Label>
                <Input name='maxHEnergyConsumption' id='MaxEnergyConsumptionField'
                       onChange={handleChange}
                       defaultValue={formControls.maxHEnergyConsumption.value}
                       touched={formControls.maxHEnergyConsumption.touched ? 1 : 0}
                       valid={formControls.maxHEnergyConsumption.valid}
                />
                {formControls.maxHEnergyConsumption.touched && !formControls.maxHEnergyConsumption.valid &&
                <div className={"error-message row"}> * Energy consumption must have a valid format </div>}
            </FormGroup>

            <FormGroup id='userId'>
                <Label for='userIdField'> User ID: </Label>
                <Input name='userId' id='userIdField'
                       onChange={handleChange}
                       defaultValue={formControls.userId.value}
                       touched={formControls.userId.touched ? 1 : 0}
                       valid={formControls.userId.valid}
                />
                {formControls.userId.touched && !formControls.userId.valid &&
                <div className={"error-message row"}> * User ID must have 36 characters </div>}
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

export default EditDeviceForm;
