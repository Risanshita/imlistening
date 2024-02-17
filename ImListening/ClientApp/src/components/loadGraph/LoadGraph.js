import * as echarts from "echarts";
import { useEffect, useState } from "react";
import "./LoadGraphStyle.css";
import { authHeader, getUserId } from "../../Util";
import { HubConnectionBuilder } from "@microsoft/signalr";
import ApexCharts from "apexcharts";
var seriesList = [];
function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}
var chart;
let XAXISRANGE = 600000;
const LoadGraph = () => {
  const options = {
    chart: {
      id: "realtime",
      height: 700,
      width: 1000,
      type: "line",
      animations: {
        enabled: true,
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
      text: "Dynamic Updating Chart",
      align: "left",
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "datetime",
      range: XAXISRANGE,
    },
    yaxis: {
      // max: 100,
    },
    legend: {
      show: true,
    },
  };

  const [isNoDataAvailable, setIsNoDataAvailable] = useState(true);

  const initChart = async () => {
    var allPaths = await getAllPaths();
    if (!(Array.isArray(allPaths) && allPaths.length > 0)) {
      setIsNoDataAvailable(true);
      return;
    }
    setIsNoDataAvailable(false);

    const paths = allPaths.map((e) => e.path).filter(onlyUnique); // Add 'NewsPage'
    // const paths = ["NewsPage"];
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
    chart = new ApexCharts(document.querySelector("#chart"), op);

    chart.render();
    await fetchLoadCount();
  };

  // Call the function when the component mounts
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
              var se = [];
              message.forEach((a) => {
                var s = seriesList.find((b) => b.name === a.path);
                s.data.push({
                  x: getTime(a.time),
                  y: a.hitCount,
                });
                se.push(s);
              });
              seriesList = se;
              ApexCharts.exec("realtime", "updateSeries", se);
            } catch (error) {}
          });
        }
      })
      .catch((e) => console.log("Connection failed: ", e));
  };
  return (
    <>
      <div className="container" style={{ width: "100%" }}>
        <div id="chart" style={{ width: "600px", height: "500px" }}></div>
      </div>
    </>
  );
};

export default LoadGraph;
