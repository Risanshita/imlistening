import { Button, Checkbox, Form, Input, Row, message,Col } from 'antd';
import "./LoginStyle.css";
const Login = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const onFinish = (values) => {
        console.log('Success:', values);
        login(values);
    };

    const login = async (values) => {
        try {
            try {
                const response = await fetch('api/users/authenticate', {
                    body: JSON.stringify(values),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const responseData = await response.json();
                if (!response.ok) {
                    const msg = responseData.message ? responseData.message : Object.values(responseData.errors)[0][0];
                    if (msg) {
                        messageApi.open({
                            type: 'error',
                            content: msg,
                        });
                    }
                } else {
                    responseData.authdata = window.btoa(values.username + ':' + values.password);
                    localStorage.setItem('user', JSON.stringify(responseData));
                    messageApi.success({
                        type: 'success',
                        content: 'Login successful!',
                    });
                    console.log(props);
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (<>
        {contextHolder}
       <Row justify="center" align="middle" style={{ height: '100vh' }}>
       <Col>
         <h2  className="loginHeading">Login</h2>
       <Form
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            style={{
                maxWidth: 600,
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[
                    {
                        required: true,
                        message: 'Please input your username!',
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="remember"
                valuePropName="checked"
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
       </Col>
        </Row>
    </>
    );
}
export default Login;