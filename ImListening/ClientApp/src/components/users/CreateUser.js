import { Modal, Button, Form, Input, Row, message, Col } from 'antd';
import "./userStyle.css";
const CreateUser = ({ isOpen, onClose }) => {

    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = (values) => {
        console.log('Success:', values);
        adduser(values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const adduser = async (values) => {
        try {
            try {
                const response = await fetch('api/users', {
                    body: JSON.stringify({
                        "username": values.username,
                        "description": values.description,
                        "password": values.password
                    }),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const responseData = await response.json();
                    var msg = Object.values(responseData.errors)[0][0]
                    if (msg) {
                        messageApi.open({
                            type: 'error',
                            content: msg,
                        });
                    }
                    //throw new Error('Request failed');
                } else {
                    messageApi.success({
                        type: 'success',
                        content: 'User created!',
                    });
                    onClose();
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    return (
        <>   {contextHolder}
            <Modal
                // title="Add new user"
                centered
                open={isOpen}
                footer={null}
                onCancel={onClose}
                destroyOnClose={true}
            >

                <div style={{ padding: 20 }}>
                <h4 className="heading">Create New User</h4>
                    <Form
                        name="userform"
                        // labelCol={{
                        //     span: 8,
                        // }}
                        // wrapperCol={{
                        //     span: 16,
                        // }}
                        // style={{
                        //     maxWidth: 600,
                        // }}
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        onReset={onClose}
                    >
                        <h4 className="urllable">Username</h4>
                        <Form.Item
                            // label="Username"
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your username!',
                                },
                            ]}
                        >
                            <Input   className="inputField" />
                        </Form.Item>
                        <h4 className="urllable">Password</h4>
                        <Form.Item
                            // label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!',
                                },
                            ]}
                        >
                            <Input.Password   className="inputField"/>
                        </Form.Item>
                        <h4 className="urllable">Description</h4>
                        <Form.Item
                            // label="Description"
                            name="description"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your user description!',
                                },
                            ]}
                        >
                            <Input    className="inputField"/>
                        </Form.Item>

                        <Form.Item
                            // wrapperCol={{
                            //     offset: 8,
                            //     span: 16,
                            // }}
                        >
                            <Row justify={'space-between'}>
                                <Col xs={24} sm={24} md={12} lg={11} xl={11}>
                                    <Button type="primary" htmlType="submit"  className="primaryBtn">
                                        Submit
                                    </Button>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={11} xl={11}>
                                    <Button type="dashed" htmlType="reset"  className="secondryBtn">
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </>
    );
};
export default CreateUser;