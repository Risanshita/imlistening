import {
  Modal,
  Button,
  Form,
  Input,
  Row,
  message,
  Dropdown,
  Col,
  InputNumber,
  Select,
} from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { authHeader } from "../../Util";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
const CreateUrl = ({ isOpen, onClose, editData }) => {
  const languageMap = {
    "text/css": "css",
    "text/csv": "csv",
    "text/html": "html",
    "text/plain": "txt",
    "application/xml": "xml",
    "application/json": "json",
  };
  const [messageApi, contextHolder] = message.useMessage();
  const [editorValue, setEditorValue] = useState();
  const [language, setlanguage] = useState("json");
  const [form] = Form.useForm();

  useEffect(() => {
    if (form && editData && editData.id) {
      form.setFieldsValue({ ...editData, path: editData.id });
      setEditorValue(editData.response);
    } else {
      form.resetFields([
        "path",
        "statusCode",
        "contentType",
        "timeout",
        "expireAfterMin",
        "response",
      ]);
    }
  }, [isOpen]);

  const onFinish = (values) => {
    console.log("Success:", values);
    addUrl(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const addUrl = async (values) => {
    if (editData && editData.id) {
      await handleEdit(values);
      return;
    }
    try {
      try {
        values.response = editorValue;
        const response = await fetch("api/webhooks", {
          body: JSON.stringify(values),
          method: "POST",
          headers: authHeader({
            "Content-Type": "application/json",
          }),
        });
        if (!response.ok) {
          const responseData = await response.json();
          var msg = Object.values(responseData.errors)[0][0];
          if (msg) {
            messageApi.open({
              type: "error",
              content: msg,
            });
          }
          //throw new Error('Request failed');
        } else {
          messageApi.success({
            type: "success",
            content: "URL created!",
          });
          setEditorValue("");
          onClose();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleEdit = async (values) => {
    try {
      try {
        values.response = editorValue;
        const response = await fetch("api/webhooks/" + values.path, {
          body: JSON.stringify(values),
          method: "PUT",
          headers: authHeader({
            "Content-Type": "application/json",
          }),
        });
        if (!response.ok) {
          const responseData = await response.json();
          var msg = Object.values(responseData.errors)[0][0];
          if (msg) {
            messageApi.open({
              type: "error",
              content: msg,
            });
          }
          //throw new Error('Request failed');
        } else {
          messageApi.success({
            type: "success",
            content: "URL updated!",
          });
          onClose();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function handleEditorChange(value, event) {
    console.log(value);
    setEditorValue(value);
  }

  const options = [
    {
      value: "text/css",
      label: "text/css",
    },
    {
      value: "text/csv",
      label: "text/csv",
    },
    {
      value: "text/html",
      label: "text/html",
    },
    {
      value: "text/plain",
      label: "text/plain",
    },
    {
      value: "application/xml",
      label: "application/xml",
    },
    {
      value: "application/json",
      label: "application/json",
    },
  ];
  const onChange = (value) => {
    setlanguage(languageMap[value]);
    console.log(`selected ${language}`);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };
  return (
    <>
      {" "}
      {contextHolder}
      <Modal
        // title="Create new url"
        centered
        open={isOpen}
        footer={null}
        onCancel={onClose}
        className="NewUrlBox"
        destroyOnClose={true}
      >
        <div style={{ padding: 0 }}>
          <h4 className="heading">Create New Url</h4>
          <Form
            form={form}
            name="newurlform"
            // labelCol={{
            //   span: 8,
            // }}
            // wrapperCol={{
            //   span: 16,
            // }}
            // style={{
            //   maxWidth: 600,
            // }}
            initialValues={{
              remember: false,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            onReset={onClose}
          >
            <h4 className="urllable">Url Path</h4>
            <Form.Item
              name={"path"}
              // label="Url Path"
              rules={[
                {
                  min: 5,
                  max: 50,
                  message: "Path length should be b/w 5 to 50 character.",
                },
              ]}
            >
              <Input className="inputField" placeholder="Default <guid>" />
            </Form.Item>
            <h4 className="urllable">Status Code</h4>
            <Form.Item
              name={"statusCode"}
              // label="StatusCode"
              rules={[
                {
                  type: "number",
                  min: 100,
                  max: 599,
                },
              ]}
            >
              <InputNumber className="inputField" placeholder="Default 200" />
            </Form.Item>
            <h4 className="urllable">ContentType</h4>
            <Form.Item name={"contentType"}>
              {/* <Input placeholder="Default text/plain" className="inputField" /> */}
              <Select
                options={options}
                showSearch
                placeholder="Select a person"
                optionFilterProp="children"
                onChange={onChange}
                onSearch={onSearch}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <h4 className="urllable">Timeout(ms)</h4>
            <Form.Item
              name={"timeout"}
              // label="Timeout(ms)"
              rules={[
                {
                  type: "number",
                  min: 0,
                  max: 600000,
                },
              ]}
            >
              <InputNumber className="inputField" placeholder="Default 0" />
            </Form.Item>
            <h4 className="urllable">Expire after minutes</h4>
            <Form.Item
              name={"expireAfterMin"}
              rules={[
                {
                  type: "number",
                  min: 1,
                  max: 525600,
                },
              ]}
            >
              <InputNumber
                className="inputField"
                placeholder="Default 525600"
              />
            </Form.Item>
            <h4 className="urllable">ForwardTo</h4>
            <Form.Item name={"forwardTo"}>
              <Input placeholder="Url" className="inputField" />
            </Form.Item>
            <h4 className="urllable">Response</h4>

            {/* <Input.TextArea rows={5} className="inputField" /> */}
            <div>
              <Editor
                className="codeArea"
                height="300px"
                language={language}
                theme="vs-dark"
                onChange={handleEditorChange}
                value={editorValue}
              />
            </div>
            <br></br>
            <Form.Item>
              <Row justify={"space-between"} style={{ gap: "10px" }}>
                <Col xs={24} sm={24} md={11} lg={11} xl={11}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="primaryBtn"
                  >
                    Submit
                  </Button>
                </Col>
                <Col xs={24} sm={24} md={11} lg={11} xl={11}>
                  <Button
                    type="dashed"
                    htmlType="reset"
                    className="secondryBtn"
                  >
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
