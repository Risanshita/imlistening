import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { authHeader, getUserId } from "../../Util";
import {
  Card,
  Col,
  Descriptions,
  List,
  Row,
  message,
  Select,
  Dropdown,
  Space,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  LinkOutlined,
  ArrowDownOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import "./Style.css";
const History = () => {
  const [history, setHistory] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [previewWebhook, setPreviewWebhook] = useState(null);
  const [allWebhookPath, setAllWebhookPath] = useState([]);
  const [selectedWebhookPath, setSelectedWebhookPath] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleItemClick = (webhook) => {
    setSelectedWebhook(webhook);
  };

  const onItemPreview = (webhook) => {
    if (!selectedWebhook) handleItemClick(webhook);
    setPreviewWebhook(webhook);
  };

  useEffect(() => {
    fetchData();
    getAllPaths();
    const url = `${window.location.protocol}//${window.location.hostname}:7143/chatHub`;

    const connection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then((result) => {
        const userId = getUserId();
        console.log("Connected!: " + userId);
        if (userId) {
          connection.on(userId, (message) => {
            processMessage(message);
          });
        }
      })
      .catch((e) => console.log("Connection failed: ", e));
  }, []);

  const fetchData = async (selectedPaths = [], isLoadMore = false) => {
    try {
      try {
        const pathQueryString = selectedPaths
          .map((path) => `webhookPath=${path}`)
          .join("&");
        const response = await fetch(
          `api/history?skip=${isLoadMore ? history.length : 0}&${pathQueryString}`,
          {
            headers: authHeader(),
          }
        );
        if (!response.ok) {
          throw new Error("Request failed");
        }
        const responseData = await response.json();
        for (const element of responseData) {
          element.requestInfos = element.requestInfos?.reduce(
            (result, item) => {
              const key = item.resource;
              if (!result[key]) {
                result[key] = [];
              }
              result[key].push(item);
              return result;
            },
            {}
          );
        }
        if (isLoadMore) {
          setHistory((prevMessages) => [...prevMessages, ...responseData]);
        } else {
          setHistory([...responseData]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const processMessage = (message) => {
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
  };
  const copyResponse = () => {
    const jsonText = JSON.stringify(selectedWebhook, null, 2);
    navigator.clipboard
      .writeText(jsonText)
      .then(() => {
        messageApi.success({
          content: "Copied to clipboard!",
        });
      })
      .catch((error) => {
        messageApi.error({
          content: "Failed to copy to clipboard!",
        });
      });
  };

  function convertArrayToCSV(obj) {
    const csvArray = Object.keys(obj).map((key) => obj[key]);
    const csvString = csvArray.join(",");
    return csvString;
  }

  function downloadJSON(history, filename) {
    const jsonString = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  }

  const handleChange = (value) => {
    setSelectedWebhookPath(value);
  };
  useEffect(() => {
    fetchData(selectedWebhookPath);
  }, [selectedWebhookPath]);

  const getAllPaths = async () => {
    try {
      const response = await fetch("/api/webhooks", {
        headers: authHeader(),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      const responseData = await response.json();

      var ss = responseData.map((e) => e.id);
      setAllWebhookPath([...ss]);
    } catch (error) {
      console.error("Error fetching webhook paths data:", error);
    }
  };

  const options = allWebhookPath.map((e) => ({ label: e, value: e }));

  const items = [
    {
      label: "10000",
      key: "10000",
    },
    {
      label: "50000",
      key: "50000",
    },
    {
      label: "100000",
      key: "100000",
    },
    {
      label: "Export All",
      key: "0",
    },
  ];
  const handleMenuClick = (e) => {
    getHistory(e.key);
  };
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  const handleButtonClick = (e) => {
    getHistory(5000);
  };

  const downloadCurrentHistory = () => {
    downloadJSON(history, "CurrentHistory");
  };

  const getHistory = (dataCount) => {
    const url = `api/history?skip=0&take=${dataCount}`;
    fetch(url, {
      method: "GET",
      headers: authHeader(),
    })
      .then((response) => response.json())
      .then((data) => {
        downloadJSON(data, `WebhookHistory_${dataCount}`);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div>
      {contextHolder}
      <Row style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex" }}>
          <h2 className="Heading">History</h2>
          <Tooltip
            title="Download history as Json"
            style={{ backgroundColor: "white" }}
          >
            <ArrowDownOutlined
              onClick={downloadCurrentHistory}
              className="downloadCurrentHistory"
            />
          </Tooltip>
        </div>

        <div className="filterBox">
          <Select
            mode="multiple"
            style={{
              width: "600px",
            }}
            placeholder="Filter"
            onChange={handleChange}
            optionLabelProp="label"
            options={options}
            optionRender={(option) => (
              <Space>
                <span role="img" aria-label={option.data.label}>
                  {option.data.emoji}
                </span>
                {option.data.desc}
              </Space>
            )}
          />
          <Tooltip
            title="Export last 5000 history"
            style={{ backgroundColor: "white" }}
          >
            <Dropdown.Button
              label="Export Json"
              menu={menuProps}
              onClick={handleButtonClick}
            >
              Export json
            </Dropdown.Button>
          </Tooltip>
        </div>
      </Row>
      <Row justify={"space-between"} gutter={40}>
        <Col
          xs={24}
          sm={24}
          md={8}
          className="WebListBox"
          style={{
            height: "calc(100vh)",
            overflowY: "auto",
            overflowX: "hidden",
            padding: 10,
          }}
        >
          <WebhookList
            className="WebListBox"
            webhooks={history}
            onItemClick={handleItemClick}
            onItemPreview={onItemPreview}
          />
        </Col>
        {selectedWebhook || previewWebhook ? (
          <Col
            md={16}
            style={{
              border: "1px dashed gray",
              wordWrap: "break-word",
              padding: 5,
              borderRadius: 10,
              height: "fit-content",
            }}
          >
            <div>
              <div className="webhookTitle">
                <h2 className="webdetails">History Details</h2>
                {/* <button onClick={copyResponse} className="copyResponse">
                  Copy Response
                </button> */}

                <CopyOutlined
                  width={60}
                  height={60}
                  className="copyResponse"
                  onClick={copyResponse}
                />
              </div>
              <WebhookDetails webhook={previewWebhook ?? selectedWebhook} />
            </div>
          </Col>
        ) : (
          <Col
            md={16}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px dashed gray",
              wordWrap: "break-word",
              padding: 5,
              borderRadius: 10,
              height: "85vh",
              color: "grey",
            }}
          >
            No webhook selected
          </Col>
        )}
      </Row>
    </div>
  );
};

const WebhookList = ({ webhooks, onItemClick, onItemPreview }) => (
  <List
    dataSource={webhooks}
    renderItem={(item) => (
      <List.Item key={item.id} style={{ padding: "5px 0" }}>
        <Card
          className="historyGrid"
          title={item.webhookPath}
          style={{ border: "none", wordWrap: "break-word" }}
          headStyle={{ padding: "0 10px", height: "auto" }}
          hoverable={true}
          bodyStyle={{ padding: "0 10px" }}
          onClick={() => onItemClick(item)}
          onMouseEnter={() => onItemPreview(item)}
          onMouseLeave={() => onItemPreview(null)}
        >
          <p className="receivedTime">
            <ClockCircleOutlined /> Received At:{" "}
            {new Date(item.createAtUtc).toLocaleString()}
          </p>
          <p className="receivedTime">
            <LinkOutlined /> URL: {"{baseurl}/" + item.webhookId}
          </p>
        </Card>
      </List.Item>
    )}
  />
);
const WebhookDetails = ({ webhook }) => (
  <Card
    title={
      "{baseurl}/" +
      webhook.webhookId +
      " - " +
      new Date(webhook.createAtUtc).toLocaleString()
    }
  >
    {Object.keys(webhook.requestInfos).map((key) => (
      <div key={key}>
        <h5 style={{ color: "#000064" }}>{key}</h5>
        <Row style={{ paddingBottom: 15 }}>
          {webhook.requestInfos[key].map((info) => (
            <Col md={12} key={info.key}>
              <strong style={{ color: "#000000b3" }}>{info.key}:</strong>{" "}
              {info.value}
            </Col>
          ))}
        </Row>
      </div>
    ))}
  </Card>
);

const WebhookDetailsV2 = ({ selectedWebhook }) =>
  selectedWebhook && (
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
  );
export default History;
