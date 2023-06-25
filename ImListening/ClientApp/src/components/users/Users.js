import { Button, Popconfirm, Row, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import CreateUser from './CreateUser';
import Title from 'antd/es/typography/Title';

const Users = () => {

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            try {
                const response = await fetch('api/users');
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                const responseData = await response.json();
                // Process responseData as needed
                setData(responseData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Role',
            key: 'role',
            dataIndex: 'role',
            render: (role) => (
                <span>
                    <Tag key={"user_table_tag" + role.id} color={role === 'User' ? 'green' : 'volcano'}>
                        {role.toUpperCase()}
                    </Tag>
                </span>
            ),
        },
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: (_, record) =>
        //         <Popconfirm key={"user_table_action" + record.id} title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
        //             <a style={{ color: 'red' }}>Delete</a>
        //         </Popconfirm>,
        // },
    ];

    const handleDelete = async (key) => {
        setIsLoading(true);
        try {
            try {
                const response = await fetch('api/users/' + key, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                fetchData();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    const showModal = () => {
        setOpen(true);
    };

    return (
        <div>
            <Row justify={'space-between'} style={{ paddingBottom: 10 }}>
                <Title level={4}>Manage Users</Title>
                <Button type='primary' onClick={showModal}>New User</Button>
            </Row>
            <Table key={"user_table"} rowKey={"rowkey"} loading={isLoading}
                columns={columns}
                pagination={{
                    position: ['none', 'bottomRight'], pageSize: 20
                }}
                dataSource={data}
            />
            {<CreateUser isOpen={open} onClose={() => { setOpen(false); fetchData() }} />}
        </div>
    );
};
export default Users;