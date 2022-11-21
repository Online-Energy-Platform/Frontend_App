import React, {useEffect} from 'react';
import {Button, Card, CardHeader, Col, Container, Jumbotron, Modal, ModalBody, ModalHeader, Row} from 'reactstrap';

import BackgroundImg from '../commons/images/blue.png';
import LoginForm from "./components/login-form";
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";

const backgroundStyle = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: "100%",
    height: "1920px",
    backgroundImage: `url(${BackgroundImg})`
};
const textStyle = { color: 'white', };

function Home() {

    return (
        <div>
            <CardHeader>
                <strong> Login to your account </strong>
            </CardHeader>
            <Card variant="outlined">
                <Row>
                    <Col sm={{ size: '8', offset: 1 }}>
                        <LoginForm />
                    </Col>
                </Row>

            </Card>
        </div>
    );
}


export default Home;