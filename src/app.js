import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import NavigationBar from './navigation-bar';
import Home from './home/home';
import UserContainer from './user/user-container';
import DeviceContainer from './device/device-container';
import ErrorPage from './commons/errorhandling/error-page';
import styles from './commons/styles/project-style.css';
import ClientContainer from "./user/client-container";

/*
    Namings: https://reactjs.org/docs/jsx-in-depth.html#html-tags-vs.-react-components
    Should I use hooks?: https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both
*/
function App() {

    function resetCookies() { //functia care reseteaza iconitele -> trimisa la navbar -> logout user.
        localStorage.clear();
        console.log("User: " + JSON.parse(localStorage.getItem('user')));
    }

    return (
        <div className={styles.back}>
            <Router>
                <div>
                    <NavigationBar onClickFunction={resetCookies}/>
                    <Switch>
                        <Route
                            exact
                            path='/'
                            render={() => <Home />}
                        />
                        <Route
                            exact
                            path='/user'
                            render={() => <UserContainer />}
                        />

                        <Route
                            exact
                            path='/device'
                            render={() => <DeviceContainer />}
                        />

                        <Route
                            exact
                            path='/client'
                            render={() => <ClientContainer />}
                        />

                        {/*Error*/}
                        <Route
                            exact
                            path='/error'
                            render={() => <ErrorPage />}
                        />

                        <Route render={() => <ErrorPage />} />
                    </Switch>
                </div>
            </Router>
        </div>
    );
}

export default App;
