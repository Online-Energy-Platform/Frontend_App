import React from 'react'
import { DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavbarBrand, NavLink, UncontrolledDropdown } from 'reactstrap';
import logo from './commons/images/icon.png';
import { withRouter } from "react-router-dom";

const textStyle = {
    color: 'white',
    textDecoration: 'none'
};

function NavigationBar(props) {

    return (
        <div>
            <Navbar color="dark" light expand="md">
                <NavbarBrand href="/" onClick={props.onClickFunction}> {/*functie care la apasarea iconitei reseteaza cookies -> logout user*/}
                    <img src={logo} width={"50"}
                        height={"35"} />
                </NavbarBrand>
                <Nav className="mr-auto" navbar>

                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle style={textStyle} nav caret>
                            Menu
                        </DropdownToggle>
                        <DropdownMenu right >

                            <DropdownItem>
                                <NavLink href="/user">Users</NavLink>
                            </DropdownItem>

                            <DropdownItem>
                                <NavLink href="/device">Devices</NavLink>
                            </DropdownItem>

                            <DropdownItem>
                                <NavLink href="/client">Client</NavLink>
                            </DropdownItem>


                        </DropdownMenu>

                    </UncontrolledDropdown>

                </Nav>
            </Navbar>
        </div>
    );
}

export default withRouter(NavigationBar);
