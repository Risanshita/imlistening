import * as echarts from "echarts";
import { useEffect, useState } from "react";
import "./LoadGraphStyle.css";
import { authHeader, getUserId } from "../../Util";
import { HubConnectionBuilder } from "@microsoft/signalr";
function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}
const LoadGraph = () => {
  const [sourceData, setSourceData] = useState([
    { time: 0, path: "", hitCount: 0 },
  ]);
  const [isNoDataAvailable, setIsNoDataAvailable] = useState(true);
  let chartDom;
  let myChart;

  // var dummyDatat = [
  //   {time : 0, path : "NewsPage", hitCount : 2},
  //   {time : 3, path : "NewsPage", hitCount : 12},
  //   {time : 5, path : "NewsPage", hitCount : 32},
  //   {time : 9, path : "NewsPage", hitCount : 54},
  // ]
  const initEChartsGraph = async (_rawData) => {
    var initData = _rawData || sourceData;
    if (!_rawData) {
      initData = await getAllPaths();
      if (!(Array.isArray(initData) && initData.length > 0)) {
        setIsNoDataAvailable(true);
        return;
      }
      setIsNoDataAvailable(false);
      setSourceData(initData);
    }

    const paths = initData.map((e) => e.path).filter(onlyUnique); // Add 'NewsPage'
    // const paths = ["NewsPage"];
    console.log(paths);
    const datasetWithFilters = [];
    const seriesList = [];

    echarts.util.each(paths, function (path) {
      var datasetId = "dataset_" + path;
      datasetWithFilters.push({
        id: datasetId,
        fromDatasetId: "dataset_raw",
        transform: {
          type: "filter",
          config: {
            and: [
              { dimension: "time", gte: 0 },
              { dimension: "path", "=": path },
            ],
          },
        },
      });
      seriesList.push({
        type: "line",
        datasetId: datasetId,
        showSymbol: true,
        name: path,
        endLabel: {
          show: true,
          formatter: function (params) {
            return params.seriesName + ": " + params.data.hitCount;
          },
        },
        labelLayout: {
          moveOverlap: "shiftY",
        },
        emphasis: {
          focus: "series",
        },
        encode: {
          x: "time",
          y: "hitCount",
          label: ["path", "hitCount"],
          itemName: "time",
          tooltip: ["hitCount"],
        },
      });
    });

    const option = {
      animationDuration: 10000,
      dataset: [
        {
          id: "dataset_raw",
          source: initData,
        },
        ...datasetWithFilters,
      ],
      title: {
        text: "Url Load Graph is Here",
      },
      tooltip: {
        order: "valueDesc",
        trigger: "axis",
      },
      // xAxis: {
      //   type: 'category',
      //   nameLocation: 'middle',
      // },
      yAxis: {
        name: "hitCount",
      },
      xAxis: {
        name: "time",
      },
      grid: {
        right: 140,
      },
      series: seriesList,
    };

    myChart.setOption(option);
  };

  // Call the function when the component mounts
  useEffect(async () => {
    chartDom = document.getElementById("main");
    myChart = echarts.init(chartDom);
    await initEChartsGraph();
    await fetchLoadCount();
  }, []);

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
              var option = myChart.getOption();
              var ls = [...option.dataset[0].source, ...message];
              console.log(ls);
              setSourceData([...ls]);
              // initEChartsGraph(ls);
              option.dataset[0].source = ls;
              myChart.setOption(option);
              myChart.appendData({
                seriesIndex: 0,
                data: ls,
              });
              console.log(ls);
            } catch (error) {}
          });
        }
      })
      .catch((e) => console.log("Connection failed: ", e));
  };
  return (
    <>
      <div className="container" style={{ width: "100%" }}>
        <div id="main" style={{ width: "100%", height: "500px" }}></div>
      </div>
    </>
  );
};

export default LoadGraph;
