import { Button, Checkbox, Form, Input, Row, message, Col } from "antd";
import "./LoginStyle.css";
import { AiOutlineLogin } from "react-icons/ai";
import { FiLock, FiSmile } from "react-icons/fi";
import useSelection from "antd/es/table/hooks/useSelection";
import { useState } from "react";
import { setIslogin } from "../Util";
import event from "../event";
const Login = (props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isLogin, setIslogin] = useState();
  const onFinish = (values) => {
    console.log("Success:", values);
    login(values);
  };

  const login = async (values) => {
    try {
      try {
        const response = await fetch("api/users/authenticate", {
          body: JSON.stringify(values),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await response.json();
        if (!response.ok) {
          const msg = responseData.message
            ? responseData.message
            : Object.values(responseData.errors)[0][0];
          if (msg) {
            messageApi.open({
              type: "error",
              content: msg,
            });
          }
        } else {
          responseData.authdata = window.btoa(
            values.username + ":" + values.password
          );
          event.emit("onLoggedIn");
          localStorage.setItem("user", JSON.stringify(responseData));
          messageApi.success({
            type: "success",
            content: "Login successful!",
          });
          message.success("Login Success");
          setIslogin(true);
          console.log(props);
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" style={{ height: "90vh" }}>
        <Col className="LoginBox">
          <h2 className="loginHeading">ACCOUNT LOGIN</h2>
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <h4 className="lable">USERNAME</h4>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input className="userNameField" />
            </Form.Item>

            <h4 className="lable">PASSWORD</h4>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password className="pwdNameField" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox className="Checkbox">Remember me</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button className="loginBtn" type="primary" htmlType="submit">
                <AiOutlineLogin className="icon" /> LOGIN
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};
export default Login;
