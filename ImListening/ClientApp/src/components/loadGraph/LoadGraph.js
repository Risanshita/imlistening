import { useEffect, useState } from "react";
import "./LoadGraphStyle.css";
import { authHeader, getUserId } from "../../Util";
import { HubConnectionBuilder } from "@microsoft/signalr";
import ApexCharts from "apexcharts";
import { Button, List, Row, Typography } from "antd";
import { Link } from "react-router-dom";
var seriesList = [];
var XAXISRANGE = 2000;
var MAX_XAXISRANGE = 3600000;
var options = {
  chart: {
    id: "realtime",
    height: 700,
    width: 1000,
    type: "line",
    animations: {
      enabled: false,
      easing: "linear",
      dynamicAnimation: {
        speed: 1000,
      },
    },
    toolbar: {
      show: true,
    },
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
  },
  title: {
    text: "Hit counts",
    align: "left",
  },
  markers: {
    size: 0,
  },
  xaxis: {
    type: "datetime",
    range: XAXISRANGE,
    labels: {
      show: true,

      formatter: function (value, timestamp, opts) {
        return (
          new Date(value).getHours() +
          ":" +
          new Date(value).getMinutes() +
          ":" +
          new Date(value).getSeconds()
        );
      },
    },
    tooltip: {
      formatter: function (val, opts) {
        return (
          new Date(val).getHours() +
          ":" +
          new Date(val).getMinutes() +
          ":" +
          new Date(val).getSeconds()
        );
      },
    },
  },
  yaxis: {},
  legend: {
    show: true,
  },
};
var isPause = false;
function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}
const LoadGraph = () => {
  const [isNoDataAvailable, setIsNoDataAvailable] = useState(true);
  const [paths, setPaths] = useState([]);

  const initChart = async () => {
    var allPaths = await getAllPaths();
    if (!(Array.isArray(allPaths) && allPaths.length > 0)) {
      setIsNoDataAvailable(true);
      return;
    }
    setIsNoDataAvailable(false);

    const paths = allPaths.map((e) => e.path).filter(onlyUnique);
    console.log(paths);
    seriesList = allPaths.map((a) => ({
      data: [
        {
          x: getTime(a.time),
          y: a.hitCount,
        },
      ],
      name: a.path,
      type: "line",
    }));

    var op = { ...options, series: seriesList };
    console.log(op);
    var chart = new ApexCharts(document.querySelector("#chart"), op);

    chart.render();
    await fetchLoadCount();
  };

  useEffect(() => {
    initChart();
  }, []);

  const getTime = (time) => {
    return new Date(time).getTime();
  };
  const getAllPaths = async () => {
    const response = await fetch("history/load-test", {
      headers: authHeader(),
    });
    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  };

  const fetchLoadCount = async () => {
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
          connection.on(userId + "|load-test-result", async (message) => {
            try {
              setPaths(message);
              var se = [];
              message.forEach((a) => {
                var s = seriesList.find((b) => b.name === a.path);
                if (s.data.length >= MAX_XAXISRANGE / 1000) {
                  s.data.shift();
                }
                s.data.push({
                  x: getTime(a.time),
                  y: a.hitCount,
                });
                se.push(s);
              });
              seriesList = se;
              if (!isPause) ApexCharts.exec("realtime", "updateSeries", se);
              updateRange();
            } catch (error) {}
          });
        }
      })
      .catch((e) => console.log("Connection failed: ", e));
  };

  const updateRange = () => {
    if (options.xaxis.range < MAX_XAXISRANGE) {
      options.xaxis.range += 1000;
      if (!isPause) {
        ApexCharts.exec("realtime", "updateOptions", options);
      }
    }
  };
  return (
    <>
      <div
        className="animationButton"
        style={{
          visibility: isNoDataAvailable ? "hidden" : "visible",
        }}
      >
       Graph Animation
        <Button
          onClick={() => {
            isPause = !isPause;
          }}
        >
      {isNoDataAvailable && (
        <div className="graphLoad">
          <h1>No LoadGraphStyle Available</h1>
          <Link to="/urls">
            <Button type="primary">Create Load Group</Button>
          </Link>
        </div>
      )}


    
          {isPause ? "Resume" : "Pause"}
        </Button>
        </div>
      <div
        className="graphContainer"
        style={{
          visibility: isNoDataAvailable ? "hidden" : "visible",
        }}
      >
       
        <div className="graphBox" id="chart" ></div>
        <div>
          <List
            className="pathList"
            header={<div>All Paths</div>}
            bordered
            dataSource={paths}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text>{item.path}</Typography.Text>
                <Typography.Text> {item.hitCount}</Typography.Text>
              </List.Item>
            )}
          />
        </div>
     
      </div>
    </>
  );
};

export default LoadGraph;
