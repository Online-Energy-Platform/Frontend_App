import React, { useState, useEffect } from 'react';
import {Col, Modal, ModalBody, ModalHeader, Row} from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import Button from "react-bootstrap/Button";

import Validate from "../../device/components/validators/device-validators";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";
import * as API_ENERGY from '../api/energy-consumption-api'
import DatePicker from 'react-date-picker';
import Chart from 'react-apexcharts'

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
    }
};

const initialData = {
    options: {
        chart: {
            id: 'energy-chart'
        },
        xaxis: {
            categories: []
        }
    },
    series: [{
        name: 'series-1',
        data: []
    }]
}

const resultEntity = {
    timestamp: '',
    energyValue: ''
}

function ViewDeviceConsumptionForm(props) {
    const [error, setError] = useState({ status: 0, errorMessage: null });
    const [formIsValid, setFormIsValid] = useState(false);
    const [formControls, setFormControls] = useState(formControlsInit);
    const [value, setValue] = useState(new Date());

    const [data, setData] = useState(initialData);

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


    function viewDeviceConsumption(params) {
        return API_ENERGY.getEnergyConsumptionByDeviceAndDate(params, (result, status, err) => {
            if (result !== null && (status === 200 || status === 201)) {
                console.log("Successfully returned consumptions...");
                // props.reloadHandler();
                let timestamps = [];
                let energyValues = [];
                result.forEach(energy => {
                    // FORMAT TIMESTAMP: YYYY-MM-DDTHH-MM-SS -> getMonth() e intre 0 si 11 deci trebuie un "+1";
                    let selectedDate;
                    if(value.getMonth() + 1 < 10){
                        if(value.getDate() < 10){
                            selectedDate = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)) + '-' + ('0' + value.getDate());
                        }
                        else{
                            selectedDate = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)) + '-' + value.getDate();
                        }
                    }
                    else{
                        if(value.getDate() < 10){
                            selectedDate = value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + ('0' + value.getDate());
                        }
                        else{
                            selectedDate = value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate();
                        }
                    }
                    let energyDate = energy.timestamp.substr(0, 10)
                    console.log("Selected date: " + selectedDate);
                    console.log("Energy date: " + energyDate);
                    //preluam doar instantele din data selectata de user.
                    if (energyDate === selectedDate) {
                        timestamps.push(energy.timestamp);
                        energyValues.push(energy.energyValue);
                    }
                });

                const newData = {
                    options: {
                        chart: {
                            id: 'energy-chart'
                        },
                        xaxis: {
                            categories: timestamps
                        }
                    },
                    series: [{
                        name: 'series-1',
                        data: energyValues
                    }]
                }

                setData(newData);

            } else {
                setError((error) => ({ status: status, errorMessage: err }));
            }
        });
    }

    function handleSubmit() {
        let params = {
            deviceId: formControls.id.value,
        };
        viewDeviceConsumption(params);
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

            <DatePicker value={value} onChange={setValue} format={"yyyy-MM-dd"}/>
            <br />

            <Row>
                <Col sm={{ size: '4', offset: 8 }}>
                    <Button type={"submit"} disabled={!formIsValid} onClick={handleSubmit}>  Submit </Button>
                </Col>
            </Row>

            <br/>
            <Row>
                <Chart options={data.options} series={data.series} type="bar" width={500} height={320} />
            </Row>

            {
                error.status > 0 &&
                <APIResponseErrorMessage errorStatus={error.status} error={error.errorMessage} />
            }

        </div>
    );
}

export default ViewDeviceConsumptionForm;
