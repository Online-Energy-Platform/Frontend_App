import React from "react";

import Table from "../../commons/tables/table";

const columns = [
    {
        Header: 'ID',
        accessor: 'id', //accessor-ul este denumirea dupa care se preiau datele din json -> daca in json e denumit fullName, asa trebuie pus si aici ca sa stie de unde sa il ia.
    },
    {
        Header: 'Full Name',
        accessor: 'fullName',
    },
    {
        Header: 'Email',
        accessor: 'email',
    },
    {
        Header: 'Role',
        accessor: 'role',
    }
];

const filters = [
    {
        accessor: 'fullName'
    }, //NU PUTEM PUNE MAI MULTE CAMPURI DE FILTER????
    // {
    //     accessor: 'role'
    // }
];

function UserTable(props) {
    return (
        <Table
            data={props.tableData}
            columns={columns}
            search={filters}
            pageSize={5}
        />
    );
}

export default UserTable;