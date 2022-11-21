import React, {useEffect} from 'react';
import styles from '../styles/project-style.css';
import { withRouter } from "react-router-dom";

function ErrorPage(props) {

    // componentDidMount
    useEffect(() => {
        let currentUser = JSON.parse(localStorage.getItem('user'));
        if(currentUser == null){
            props.history.push("/");
        }
    }, []);

    return (<h3 className={styles.errorTitle}>Page not found.</h3>);
}

export default withRouter(ErrorPage);
