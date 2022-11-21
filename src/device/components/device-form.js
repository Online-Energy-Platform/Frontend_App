import React, { useState, useEffect } from 'react';
import { Col, Row } from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import Button from "react-bootstrap/Button";

import Validate from "./validators/device-validators";
import * as API_DEVICES from "../api/device-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";

const formControlsInit = {
    Description: {
        value: '',
        placeholder: 'What is the device\'s description?...',
        valid: false,
        touched: false,
        validationRules: {
            minLength: 3,
            isRequired: true
        }
    },
    Address: {
        value: '',
        placeholder: 'Cluj-Napoca, Str. Plopilor, Nr. 14, Bl. B2, Ap. 16...',
        valid: false,
        touched: false,
        validationRules: {
            addressValidator: true,
            isRequired: true
        }
    },
    MaxEnergyConsumption: {
        value: '',
        placeholder: 'What is the device\'s max energy consumption? Ex: 400...',
        valid: false,
        touched: false,
        validationRules: {
            energyNumberValidator: true,
            isRequired: true
        }
    }
};

function DeviceForm(props) {
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


    function registerDevice(device) {
        return API_DEVICES.postDevice(device, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("Successfully inserted device with id: " + result);
                props.reloadHandler();
            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function handleSubmit() {
        let device = {
            description: formControls.Description.value,
            address: formControls.Address.value,
            maxHEnergyConsumption: formControls.MaxEnergyConsumption.value,
        };
        registerDevice(device);
    }

    return (
        <div>

            <FormGroup id='Description'>
                <Label for='DescriptionField'> Description: </Label>
                <Input name='Description' id='DescriptionField' placeholder={formControls.Description.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.Description.value}
                       touched={formControls.Description.touched ? 1 : 0}
                       valid={formControls.Description.valid}
                       required
                />
                {formControls.Description.touched && !formControls.Description.valid &&
                <div className={"error-message row"}> * Description must have at least 3 characters </div>}
            </FormGroup>

            <FormGroup id='Address'>
                <Label for='AddressField'> Address: </Label>
                <Input name='Address' id='AddressField' placeholder={formControls.Address.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.Address.value}
                       touched={formControls.Address.touched ? 1 : 0}
                       valid={formControls.Address.valid}
                       required
                />
                {formControls.Address.touched && !formControls.Address.valid &&
                <div className={"error-message row"}> * Address must have a valid format </div>}
            </FormGroup>

            <FormGroup id='MaxEnergyConsumption'>
                <Label for='MaxEnergyConsumptionField'> Max Energy Consumption: </Label>
                <Input name='MaxEnergyConsumption' id='MaxEnergyConsumptionField' placeholder={formControls.MaxEnergyConsumption.placeholder}
                       onChange={handleChange}
                       defaultValue={formControls.MaxEnergyConsumption.value}
                       touched={formControls.MaxEnergyConsumption.touched ? 1 : 0}
                       valid={formControls.MaxEnergyConsumption.valid}
                       required
                />
                {formControls.MaxEnergyConsumption.touched && !formControls.MaxEnergyConsumption.valid &&
                <div className={"error-message row"}> * Energy consumption must have a valid format </div>}
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

export default DeviceForm;
