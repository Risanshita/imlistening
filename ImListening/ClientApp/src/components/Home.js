import React, { useState, useEffect, useRef } from 'react';
import { HttpTransportType, HubConnectionBuilder } from '@microsoft/signalr';
import { authHeader, authdata, getUserId } from '../Util';
import { Button, Card, Col, Descriptions, List, Row } from 'antd';
import { ClockCircleOutlined, LinkOutlined } from '@ant-design/icons';
import "./Home_style.css";


const Home = () => {
    const [history, setHistory] = useState([]);
    const [selectedWebhook, setSelectedWebhook] = useState(null);
    const [previewWebhook, setPreviewWebhook] = useState(null);

    const handleItemClick = (webhook) => {
        setSelectedWebhook(webhook);
    };

    const onItemPreview = (webhook) => {
        if (!selectedWebhook) handleItemClick(webhook);
        setPreviewWebhook(webhook);
    };

    useEffect(() => {
        fetchData();
        const url = `${window.location.protocol}//${window.location.hostname}:7143/chatHub`;

        const connection = new HubConnectionBuilder()
            .withUrl(url)
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(result => {
                const userId = getUserId();
                console.log('Connected!: ' + userId);
                if (userId) {
                    connection.on(userId, message => {
                        proccessMessage(message);
                    });

                    connection.on(userId + "|load-test-result", message => {
                        console.log(message);
                    });
                }

                connection.on('BroadcastReceived', message => {
                    console.log("BroadcastReceived", message);
                });
            })
            .catch(e => console.log('Connection failed: ', e));
    }, []);

    const fetchData = async (path) => {
        try {
            try {
                const response = await fetch('history',
                    {
                        headers: authHeader()
                    });
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                const responseData = await response.json();

                for (const element of responseData) {
                    element.requestInfos = element.requestInfos?.reduce((result, item) => {
                        const key = item.resource;
                        if (!result[key]) {
                            result[key] = [];
                        }
                        result[key].push(item);
                        return result;
                    }, {});
                }

                setHistory((prevMessages) => [...prevMessages, ...responseData]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const proccessMessage = (message) => {
        console.log("onlyme", message);
        try {
            message.requestInfos = message.requestInfos?.reduce((result, item) => {
                const key = item.resource;
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(item);
                return result;
            }, {});

            setHistory((prevMessages) => [message, ...prevMessages]);

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <h2 className="Heading">Webhook List</h2>
            <Row justify={"space-between"} gutter={40}  >
                <Col xs={24} sm={24} md={8} className='WebListBox' style={{
                    height: 'calc(100vh)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: 10,

                }}>
                    <WebhookList className="WebListBox" webhooks={history} onItemClick={handleItemClick} onItemPreview={onItemPreview} />
                </Col>
                {(selectedWebhook || previewWebhook) && (<Col md={16}
                    style={{
                        border: '1px dashed gray',
                        wordWrap: 'break-word',
                        padding: 5,
                        borderRadius: 10,
                        height: 'fit-content'
                    }}>

                    <div>
                        <h2 className='webdetails'>Webhook Details</h2>
                        {/* <WebhookDetailsV2 webhook={previewWebhook ?? selectedWebhook} /> */}
                        <WebhookDetails webhook={previewWebhook ?? selectedWebhook} />
                    </div>
                </Col>
                )}
            </Row>
        </div >
    );
}

const WebhookList = ({ webhooks, onItemClick, onItemPreview }) => (
    <List
        dataSource={webhooks}
        renderItem={(item) => (
            <List.Item key={item.id} style={{ padding: '5px 0' }}>
                <Card className='historyGrid' title={item.webhookPath}
                    style={{ border: "none", wordWrap: 'break-word' }}

                    headStyle={{ padding: '0 10px', height: 'auto' }}
                    hoverable={true}
                    bodyStyle={{ padding: '0 10px' }}
                    onClick={() => onItemClick(item)}
                    onMouseEnter={() => onItemPreview(item)}
                    onMouseLeave={() => onItemPreview(null)}
                >
                    <p className='receivedTime'> <ClockCircleOutlined /> Received At: {new Date(item.createAtUtc).toLocaleString()}</p>
                    <p className='receivedTime'><LinkOutlined /> URL: {'{baseurl}/' + item.webhookId}</p>
                    {/* <Button type="link" onClick={() => onItemClick(item)}>View Details</Button> */}
                </Card>
            </List.Item>
        )}
    />
);
const WebhookDetails = ({ webhook }) => (
    <Card title={'{baseurl}/' + webhook.webhookId + ' - ' + new Date(webhook.createAtUtc).toLocaleString()}>
        {Object.keys(webhook.requestInfos).map((key) => (
            <div key={key}>
                <h5 style={{ color: '#000064' }}>{key}</h5>
                <Row style={{ paddingBottom: 15 }}>
                    {webhook.requestInfos[key].map((info) => (
                        <Col md={12} key={info.key}>
                            <strong style={{ color: '#000000b3' }}>{info.key}:</strong> {info.value}
                        </Col>
                    ))}
                </Row>
            </div>
        ))}
    </Card>
);

const WebhookDetailsV2 = ({ selectedWebhook }) => (selectedWebhook && (
    <div className="details-container">
        <h2>Request Details</h2>
        <Card>
            <Descriptions title="Primary" bordered column={1}>
                {selectedWebhook.requestInfos.Primary.map((info, index) => (
                    <Descriptions.Item key={index} label={info.key}>
                        {info.value}
                    </Descriptions.Item>
                ))}
            </Descriptions>
            <Descriptions title="Header" bordered column={1}>
                {selectedWebhook.requestInfos.Header.map((info, index) => (
                    <Descriptions.Item key={index} label={info.key}>
                        {info.value}
                    </Descriptions.Item>
                ))}
            </Descriptions>
            <Descriptions title="Body" bordered column={1}>
                {selectedWebhook.requestInfos.Body.map((info, index) => (
                    <Descriptions.Item key={index} label={info.key}>
                        {info.value}
                    </Descriptions.Item>
                ))}
            </Descriptions>
            <Descriptions title="Route Data" bordered column={1}>
                {selectedWebhook.requestInfos.RouteData.map((info, index) => (
                    <Descriptions.Item key={index} label={info.key}>
                        {info.value}
                    </Descriptions.Item>
                ))}
            </Descriptions>
        </Card>
    </div>
));
export default Home;