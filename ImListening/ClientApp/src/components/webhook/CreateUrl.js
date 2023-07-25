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
} from "antd";
import { CaretDownOutlined  } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import { authHeader } from "../../Util";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
const CreateUrl = ({ isOpen, onClose, editData }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [editorValue, setEditorValue] = useState(); 
  const [form] = Form.useForm();

  useEffect(() => {
    if (form && editData && editData.id) {
      form.setFieldsValue({ ...editData, path: editData.id });
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

  const LangugaeList = [
    {
      key: "HTML",
      label: "HTML",
    },
    {
      key: "CSS",
      label: "CSS",
    },
    {
      key: "JavaScript",
      label: "JavaScript",
    },
    {
      key: "JSON",
      label: "JSON",
    },
    {
      key: "XML",
      label: "XML",
    },
    {
      key: "PHP",
      label: "PHP",
    },
    {
      key: "Java",
      label: "Java",
    },
    {
      key: "Python",
      label: "Python",
    },
  ];

  const itemsList = [
    {
      key: "1",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          1st menu item
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.aliyun.com"
        >
          2nd menu item
        </a>
      ),
    },
    {
      key: "3",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.luohanacademy.com"
        >
          3rd menu item
        </a>
      ),
    },
  ];
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
              <Input placeholder="Default text/plain" className="inputField" />
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
                  defaultLanguage="json"
                  defaultValue=""
                  theme="vs-dark"
                  onChange={handleEditorChange}
                />
            
              </div>
          <br></br>
            <Form.Item
            // wrapperCol={{
            //   offset: 8,
            //   span: 16,
            // }}
            >
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
