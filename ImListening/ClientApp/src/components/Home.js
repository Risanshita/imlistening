import def from "ajv/dist/vocabularies/applicator/additionalItems";
import { Button, Col, Row, Image } from "antd";
import "./Home_style.css";
import websitePreview from "../assets/images/websiteImage.png";
const Home = () => {
  return (
    <>
      <Col>
        <div className="headingBox">
          <div className="homeTitle top"> Powerful tool </div>
          <div className="homeTitle"> For Developers </div>
          <div className="homeDes">Test your endpoint and </div>
          <div className="tryButton">
            <Button type="primary" className="homeBtn">
              Try Now
            </Button>
          </div>
        </div>

        <div className="imageBox">
          <Image
            preview={false}
            src={websitePreview}
            alt="website preview"
            className="imagePreview"
          />
        </div>
      </Col>
    </>
  );
};

export default Home;
