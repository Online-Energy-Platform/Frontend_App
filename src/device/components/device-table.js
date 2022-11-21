import React from "react";

import Table from "../../commons/tables/table";

const columns = [
    {
        Header: 'ID',
        accessor: 'id',
    },
    {
        Header: 'Description',
        accessor: 'description',
    },
    {
        Header: 'Address',
        accessor: 'address',
    },
    {
        Header: 'Max Energy Consumption',
        accessor: 'maxHEnergyConsumption',
    },
    {
        Header: 'User ID',
        accessor: 'userId',
    }
];

const filters = [
    {
        accessor: 'address'
    }
];


function DeviceTable(props) {
    return (
        <Table
            data={props.tableData}
            columns={columns}
            search={filters}
            pageSize={5}
        />
    );
}

export default DeviceTable;