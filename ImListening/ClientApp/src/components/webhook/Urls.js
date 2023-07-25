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
  Divider,
} from "antd";
import { useEffect, useState } from "react";
import CreateUrl from "./CreateUrl";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import "./UrlsStyles.css";
import { CopyOutlined, EditOutlined, DeleteOutlined,LinkOutlined  } from "@ant-design/icons";
import { authHeader } from "../../Util";
import copyIcon from "../../assets/copy.png";
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

  const codeString = `<h3 className="Urltitle">Welcome</h3>
  <h4 className="lable">
    Status Code : <span className="boldLable"> 200</span>
  </h4>
  <h4 className="lable">
    Content Type : <span className="boldLable"> Plain/Text</span>
  </h4>
  <h4 className="lable">
    Timeout : <span className="boldLable">300</span>
  </h4>
  <h4 className="lable">
    Expire on : <span className="boldLable">200</span>
  </h4>`;
  return (
    <div>
      {contextHolder}
      <Row justify={"space-between"}>
        <h2 className="urlHeading">Manage Url</h2>
      <Row className="rightBox"  style={{ paddingBottom: 10 }}>
        <Search
          placeholder="Url path"
          allowClear
          onSearch={onSearch}
          style={{ paddingLeft: 10, width: 300 }}
          maxLength={50}
        />
        <Button type="primary" className="btn" onClick={showModal}>
          New Url <LinkOutlined />
        </Button>
      </Row>
      </Row>

      {/* <List
        className="demoBox"
        grid={{
          gutter: 30,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 4,
        }}
        size="small"
        dataSource={data}
        renderItem={(item) => (
          <List.Item className="CardList">
            <Card
              title={<>{item.id}</>}
              style={{
                border: "1px dashed gray",
                width: 330,
                height: 430,
                wordWrap: "break-word",
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
                  icon={<EditOutlined key="edit" style={{ color: "blue" }} />}
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
                Expire on:&nbsp;{new Date(item.expireOnUtc).toLocaleString()}
              </Row>
              <Row style={{ paddingBottom: 5 }}>
                <span style={{ fontWeight: "bold" }}>Response: </span>
              </Row>
              <textArea
                rows={8}
                value={item.response}
                disabled
                style={{ color: "black" }}
              />
            </Card>
          </List.Item>
        )}
      /> */}

      <Row justify={"space-between"}>
        {data.map((e) => (
          <Col xs={24} sm={24} md={11} lg={7} className="urlBox" key={e.id}>
            <h3 className="Urltitle">{e.id}</h3>
            <h4 className="Urllable">
              Status Code : <span className="boldLable "  style={
                    e.statusCode >= 300
                      ? { color: "red", fontWeight: "bold" }
                      : {}
                  }> {e.statusCode}</span>
            </h4>
            <h4 className="Urllable">
              Content Type : <span className="boldLable">{e.contentType} </span>
            </h4>
            <h4 className="Urllable">
              Timeout : <span className="boldLable" style={
                    e.timeout >= 10
                      ? { color: "red", fontWeight: "bold" }
                      : {}
                  }>{e.timeout}</span>
            </h4>
            <h4 className="Urllable">
              Expire on : <span className="boldLable">{new Date(e.expireOnUtc).toLocaleString()}</span>
            </h4>
            <h3 className="Urltitle">Response</h3>
            <div className="codeEditorDiv">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(codeString);
                  message.success("Code Copy");
                }}
                className="copyBtn"
              >
                <img src={copyIcon} />{" "}
              </div>
              <SyntaxHighlighter
                customStyle={{ borderRadius: "10px", padding: "10px" }}
                className="codeEditor"
                language="json"
                style={atomOneDark}
                wrapLongLines={false}
              >
                {e.response}
              </SyntaxHighlighter>
            </div>
            <Row className="bottomButton" justify={"space-between"} align={"middle"}>
              <div className="secondBtn"  onClick={() => handleEdit(e)}>
                <EditOutlined key="edit"  />
                Edit
              </div>
              <Popconfirm
                  key={"user_table_action" + e.id}
                  title="Sure to delete?"
                  onConfirm={() => handleDelete(e)}
                >
              <div className="secondBtn">
                <DeleteOutlined key="delete" /> Delete
              </div>
              </Popconfirm>,
              <div className="secondBtn" onClick={()=>handleCopy(e)}>
                <CopyOutlined key="copy" /> Url
              </div>
            </Row>
          </Col>
        ))}
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
