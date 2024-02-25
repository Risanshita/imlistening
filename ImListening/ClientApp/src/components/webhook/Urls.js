import {
  Checkbox,
  Button,
  Card,
  List,
  Popconfirm,
  Row,
  Input,
  Col,
  Space,
  Modal,
  message,
  Divider,
} from "antd";
import { useEffect, useState } from "react";
import CreateUrl from "./CreateUrl";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import "./UrlsStyles.css";
import {
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { authHeader } from "../../Util";
import copyIcon from "../../assets/copy.png";
import notUrlFound from "../../assets/images/notFoundUrl.png";
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
  const languageMap = {
    "text/css": "css",
    "text/csv": "csv",
    "text/html": "html",
    "text/plain": "txt",
    "application/xml": "xml",
    "application/json": "json",
  };
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState({});
  const [loadGroups, setLoadGroups] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [isLoadGroupPresent, setIsLoadGroupPresent] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  useEffect(() => {
    fetchData();
    fetchLoadGroup();
  }, []);

  const showWarinigModal = () => {
    setIsWarningModalOpen(true);
  };

  const handleCancel = () => {
    setIsWarningModalOpen(false);
  };

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
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const fetchLoadGroup = async () => {
    const response = await fetch("api/webhooks/load-test", {
      headers: authHeader(),
    });
    const responseData = await response.json();
    console.log(responseData);
    if (responseData.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  const createLoadGroup = async (forceCreate) => {
    if (!forceCreate) {
      const isGroupExist = await fetchLoadGroup();
      if (isGroupExist) {
        setIsLoadGroupPresent(true);
        setIsWarningModalOpen(true);
        return;
      }
    }
    messageApi.success({
      content: "Load test group created",
    });
    const paths = { paths: selectedUrls };
    const response = await fetch("api/webhooks/load-test", {
      body: JSON.stringify(paths),
      method: "POST",
      headers: authHeader({
        "Content-Type": "application/json",
      }),
    });
    console.log(response);
    if (response.status == 201) {
      setIsLoadGroupPresent(true);
      setSelectedUrls([]);
    }
    setIsLoadGroupPresent(false);
    setIsWarningModalOpen(false);
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
          content: "Copied to clipboard!",
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

  const handleLoadTesting = (e, path) => {
    const isChecked = e.target.checked;
    setSelectedUrls((prevSelectedUrls) => {
      if (isChecked) {
        return [...prevSelectedUrls, path];
      } else {
        return prevSelectedUrls.filter((url) => url !== path);
      }
    });

    console.log(selectedUrls.length);
  };

  return (
    <div>
      {contextHolder}
      <Row justify={"space-between"}>
        <h2 className="urlHeading">Manage Url</h2>
        <Row className="rightBox" style={{ paddingBottom: 10 }}>
          {selectedUrls.length > 0 ? (
            <Button
              type="primary"
              className="btn"
              onClick={() => createLoadGroup()}
            >
              Create load test group
            </Button>
          ) : null}

          <Modal
            title="Warning!"
            open={isWarningModalOpen}
            onOk={() => createLoadGroup(true)}
            onCancel={handleCancel}
          >
            <p>
              If you create a new test group, the previous group will be
              permanently deleted, and this action cannot be undone.
            </p>
          </Modal>
          <Search
            placeholder="Url path"
            allowClear
            onSearch={onSearch}
            style={{ paddingLeft: 10, width: 300 }}
            maxLength={50}
          />

          <Button type="primary" className="btn" onClick={showModal}>
            New url <LinkOutlined />
          </Button>
        </Row>
      </Row>

      {data == null || data.length == 0 ? (
        <Row justify={"center"} align={"middle"} style={{ height: "77vh" }}>
          <img src={notUrlFound} width="200px" />
        </Row>
      ) : (
        <Row justify={"start"} style={{ gap: "10px" }}>
          {data.map((e) => (
            <Col xs={24} sm={24} md={11} lg={7} className="urlBox" key={e.id}>
              <div className="idBox">
                <div className="Urltitle">{e.id}</div>
                {e.isLoadTesting ? (
                  <Checkbox
                    checked={selectedUrls.includes(e.id)}
                    disabled={
                      !selectedUrls.includes(e.id) && selectedUrls.length === 5
                    }
                    onChange={(event) => handleLoadTesting(event, e.id)}
                  />
                ) : null}
              </div>
              <h4 className="Urllable">
                Status Code :{" "}
                <span
                  className="boldLable "
                  style={
                    e.statusCode >= 300
                      ? { color: "red", fontWeight: "bold" }
                      : {}
                  }
                >
                  {" "}
                  {e.statusCode}
                </span>
              </h4>
              <h4 className="Urllable">
                Content Type :{" "}
                <span className="boldLable">{e.contentType} </span>
              </h4>
              <h4 className="Urllable">
                Timeout :{" "}
                <span
                  className="boldLable"
                  style={
                    e.timeout >= 10 ? { color: "red", fontWeight: "bold" } : {}
                  }
                >
                  {e.timeout}
                </span>
              </h4>
              <h4 className="Urllable">
                Expire on :{" "}
                <span className="boldLable">
                  {new Date(e.expireOnUtc).toLocaleString()}
                </span>
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
                  language={languageMap[e.contentType] ?? "json"}
                  style={atomOneDark}
                  wrapLongLines={false}
                >
                  {e.response}
                </SyntaxHighlighter>
              </div>
              <Row
                className="bottomButton"
                justify={"space-between"}
                align={"middle"}
              >
                <div className="secondBtn" onClick={() => handleEdit(e)}>
                  <EditOutlined key="edit" />
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
                </Popconfirm>
                ,
                <div className="secondBtn" onClick={() => handleCopy(e)}>
                  <CopyOutlined key="copy" /> Url
                </div>
              </Row>
            </Col>
          ))}
        </Row>
      )}

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
