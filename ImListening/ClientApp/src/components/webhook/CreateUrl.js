import { Modal, Button, Form, Input, Row, message, Col, InputNumber } from 'antd';
import React, { useEffect } from 'react';
import { authHeader } from '../../Util';

const CreateUrl = ({ isOpen, onClose, editData }) => {

    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    useEffect(() => {
        if (form && editData && editData.id) {
            form.setFieldsValue({ ...editData, path: editData.id });
        } else {
            form.resetFields(['path', 'statusCode', 'contentType', 'timeout', 'expireAfterMin','response']);
        }
    }, [isOpen])


    const onFinish = (values) => {
        console.log('Success:', values);
        addUrl(values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const addUrl = async (values) => {
        if (editData && editData.id) {
            await handleEdit(values);
            return;
        }
        try {
            try {
                const response = await fetch('api/webhooks', {
                    body: JSON.stringify(values),
                    method: 'POST',
                    headers: authHeader({
                        'Content-Type': 'application/json'
                    })
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
                        content: 'URL created!',
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

    const handleEdit = async (values) => {
        try {
            try {
                const response = await fetch('api/webhooks/' + values.path, {
                    body: JSON.stringify(values),
                    method: 'PUT',
                    headers: authHeader({
                        'Content-Type': 'application/json'
                    })
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
                        content: 'URL updated!',
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
                title="Create new url"
                centered
                open={isOpen}
                footer={null}
                onCancel={onClose}
                destroyOnClose={true}
            >
                <div style={{ padding: 20 }}>
                    <Form
                        form={form}
                        name="newurlform"
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
                        onReset={onClose}
                    >
                        <Form.Item
                            name={'path'}
                            label="Url Path"
                            rules={[
                                {
                                    min: 5,
                                    max: 50,
                                    message: 'Path length should be b/w 5 to 50 character.'
                                },
                            ]}
                        >
                            <Input placeholder='Default <guid>' />
                        </Form.Item>
                        <Form.Item
                            name={'statusCode'}
                            label="StatusCode"
                            rules={[
                                {
                                    type: 'number',
                                    min: 100,
                                    max: 599,
                                },
                            ]}
                            style={{ width: '100%' }}
                        >
                            <InputNumber placeholder='Default 200' style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name={'contentType'}
                            label="ContentType"
                        >
                            <Input placeholder='Default text/plain' />
                        </Form.Item>
                        <Form.Item
                            name={'timeout'}
                            label="Timeout(ms)"
                            rules={[
                                {
                                    type: 'number',
                                    min: 0,
                                    max: 600000,
                                },
                            ]} style={{ width: '100%' }}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder='Default 0' />
                        </Form.Item>
                        <Form.Item
                            name={'expireAfterMin'}
                            label="Expire after minute"
                            rules={[
                                {
                                    type: 'number',
                                    min: 1,
                                    max: 525600,
                                },
                            ]} style={{ width: '100%' }}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder='Default 525600' />
                        </Form.Item>
                        <Form.Item name={'response'} label="Response">
                            <Input.TextArea rows={5} />
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                                offset: 8,
                                span: 16,
                            }}
                        >
                            <Row justify={'space-between'}>
                                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Col>
                                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                    <Button type="dashed" htmlType="reset">
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
export default CreateUrl;