import {
  Button,
  Card,
  List,
  Popconfirm,
  Row,
  Input,
  Col,
  Space,
  message,
} from "antd";
import { useEffect, useState } from "react";
import CreateUrl from "./CreateUrl";
import "./UrlsStyles.css";
import Title from "antd/es/typography/Title";
import { CopyOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { authHeader } from "../../Util";

const { Search } = Input;

const response = JSON.parse(`{
    "id": "a93466d5-905c-45a6-9834-a56d51196279",
    "clientServiceId": "abac44e5-91c0-4c22-ae10-2e335683ac52",
    "webhookUrl": "http://webhooktestapp.us-east-1.elasticbeanstalk.com/api/webhook/secure/oauth",
    "status": "Initiated",
    "authDetails": {
      "authType": "ClientCredentials",
      "accessTokenUrl": "https://login-stage.solutionsbytext.com/connect/token",
      "clientId": "transporter-stage-client",
      "clientSecret": "pi5qlrjHuKGot562QOKYuDHfn1u58qrQtUJgEEXBEAoBDwwwwDN949",
      "scope": "transporter"
    },
    "maxNumberOfRetry": 3,
    "intervalOfRetry": [
      120,
      180,
      300
    ],
    "failedCount": 0
  }`);
const Urls = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (path) => {
    setIsLoading(true);
    try {
      try {
        const response = await fetch("api/webhooks?path=" + (path ?? ""), {
          headers: authHeader(),
        });
        if (!response.ok) {
          throw new Error("Request failed");
        }
        const responseData = await response.json();
        // Process responseData as needed
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const handleEdit = async (rec) => {
    setOpen(true);
    setSelectedRecord(rec);
  };

  const handleCopy = async (rec) => {
    var url = `${window.location.protocol}//${window.location.host}/listen/${rec.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        messageApi.success({
          content: "Url copied to clipboard!",
        });
      })
      .catch((error) => {
        messageApi.error({
          content: "Failed to copy text to clipboard!",
        });
      });
  };

  const handleDelete = async (rec) => {
    setIsLoading(true);
    try {
      try {
        const response = await fetch("api/webhooks/" + rec.id, {
          method: "DELETE",
          headers: authHeader({}),
        });
        if (!response.ok) {
          throw new Error("Request failed");
        }
        fetchData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const showModal = () => {
    setSelectedRecord(null);
    setOpen(true);
  };

  const onSearch = (path) => {
    fetchData(path);
  };
  return (
    <div>
      {contextHolder}
      <Row justify={"space-between"} style={{ paddingBottom: 10 }}>
        <Col>
          <Row>
            <Title level={4}>Manage Url</Title>
            <Search
              placeholder="Url path"
              allowClear
              onSearch={onSearch}
              style={{ paddingLeft: 10, width: 300 }}
              maxLength={50}
            />
          </Row>
        </Col>
        <Button type="primary" onClick={showModal}>
          New Url
        </Button>
      </Row>
      <Row className="RowBox">
        {
          <List
            className="liy"
            // grid={{
            //   gutter: 86,
            //   xs: 1,
            //   sm: 2,
            //   md: 2,
            //   lg: 3,
            //   xl: 4,
            // }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <Card
                  title={<>{item.id}</>}
                  style={{
                    border: "1px dashed gray",
                    width: 330,
                    height: 430,
                    // wordWrap: "break-word",
                  }}
                  actions={[
                    <Popconfirm
                      key={"user_table_action" + item.id}
                      title="Sure to delete?"
                      onConfirm={() => handleDelete(item)}
                    >
                      <Button
                        type="text"
                        shape="circle"
                        icon={<DeleteOutlined key="delete" />}
                        size={20}
                        danger
                      />
                    </Popconfirm>,
                    <Button
                      key={"user_table_action_B1" + item.id}
                      onClick={() => handleEdit(item)}
                      type="text"
                      shape="circle"
                      icon={
                        <EditOutlined key="edit" style={{ color: "blue" }} />
                      }
                      size={20}
                    />,
                    <Button
                      key={"user_table_action_B1" + item.id}
                      onClick={() => handleCopy(item)}
                      type="text"
                      shape="circle"
                      icon={<CopyOutlined key="copy" />}
                      size={20}
                    />,
                  ]}
                  headStyle={{ padding: 5, minHeight: 30 }}
                  hoverable={true}
                  bodyStyle={{ padding: 10, height: 330 }}
                >
                  <Row style={{ paddingBottom: 5 }}>
                    Status Code:&nbsp;
                    <span
                      style={
                        item.statusCode >= 300
                          ? { color: "red", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {" "}
                      {item.statusCode}
                    </span>
                  </Row>
                  <Row style={{ paddingBottom: 5 }}>
                    Content Type:&nbsp;{item.contentType}
                  </Row>
                  <Row style={{ paddingBottom: 5 }}>
                    Timeout:&nbsp;
                    <span
                      style={
                        item.timeout >= 10
                          ? { color: "red", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {item.timeout}
                    </span>{" "}
                  </Row>
                  <Row style={{ paddingBottom: 5 }}>
                    Expire on:&nbsp;
                    {new Date(item.expireOnUtc).toLocaleString()}
                  </Row>
                  <Row style={{ paddingBottom: 5 }}>
                    <span style={{ fontWeight: "bold" }}>Response: </span>
                  </Row>
                  <TextArea
                    rows={8}
                    value={item.response}
                    disabled
                    style={{ color: "black" }}
                  />
                </Card>
              </List.Item>
            )}
          />
        }
      </Row>
      {
        <CreateUrl
          isOpen={open}
          onClose={() => {
            setOpen(false);
            fetchData();
          }}
          editData={selectedRecord}
        />
      }
    </div>
  );
};
export default Urls;
