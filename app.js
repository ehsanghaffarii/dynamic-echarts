let state = "notLoaded";
let datasetUrl = "";
let source;
let data;
let cols;
let width;
let height;
let config = {};
let option = {};
let col_rel = {};
let chartDom;
let chart;
let isChartInitialized = false;
colorList = ["rgb(251, 118, 123)", "rgba(0, 215, 239, 1)"];
//
let develop = true;

const onWindowResize = () => {
  width = document.documentElement.scrollWidth;
  height = document.documentElement.scrollHeight;
  if (chart)
    chart.resize({
      width: width,
      height: height,
    });
};

const onResizeHandler = debounce(onWindowResize, 500);

window.removeEventListener("resize", onResizeHandler);
window.addEventListener("resize", onResizeHandler);

function onMessage(event) {
  if (typeof event?.data == "object") {
    return;
  }
  const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://cafedata.io",
    "*",
  ];
  if (!allowedOrigins.includes(event.origin)) {
    console.error(`Invalid origin: ${event.origin}`);
    return;
  }
  try {
    const request = JSON.parse(event.data);
    switch (request.command) {
      case "config_changed":
        update_config_handler(request.config);
        break;
      case "columns_relation_changed":
        col_rel = request.columns_relation;
        if (isChartInitialized) {
          change_col(col_rel);
        }
        break;
      case "data_changed":
        datasetUrl = request.data;
        chart_initial();
        break;
      case "get_state":
        const response = {
          command: "get_state",
          state,
        };
        window.parent.postMessage(JSON.stringify(response), event.origin);
        break;
    }
  } catch (error) {
    console.error(`Invalid request: ${error}`);
    return;
  }
}

function main() {
  //todo set col_rel and config
  if (develop) {
    col_rel = {
      size: "GDP",
      yValue: "Life expectancy",
      xValue: "Population",
      name: "Country",
      label: "Year",
    };
    config = {
      chart: {
        background: "#ffffff",
        shadowBlur: 1,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowOffsetY: 5,
        symbol: "circle",
        symbolSize: function (data) {
          return Math.sqrt(data[col_rel?.size]) / 5e2;
        },
        colorList: [
          "#fac858",
          "#ee6666",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        type: " false",
        labelPosition: "top",
        labelFormatter: function (params) {
          return params.data[col_rel?.name];
        },
        labelShow: " true",
        focus: "series",
        selectedMode: "single",
        selectColor: "#f00",
      },
      title: {
        show: true,
        text: "Life Expectancy and GDP by Country",
        left: "8%",
        top: "3%",
        color: "#020202",
        fontSize: "18",
      },
      subtext: {
        color: "#020202",
        text: "Source: World Bank",
      },
      tooltip: {
        show: true,
        trigger: "item",
        triggerOn: "mousemove",
        borderColor: "#0000f6",
        backgroundColor: "#eee",
        formatter: function (params) {
          return `data: ${params[0].name}<br/> ${params[0].seriesName}: ${params[0].value}<br/> ${params[1].seriesName}: ${params[1].value}`;
        },
      },
      legend: {
        show: true,
        right: "10%",
        top: "3%",
        data: [],
        itemStyle: {
          color: function (params) {
            return colorList[params.seriesIndex % colorList.length];
          },
        },
      },
      grid: {
        left: "8%",
        top: "10%",
      },
      xAxis: {
        splitLine: {
          lineStyle: {
            type: "dashed",
          },
        },
      },
      yAxis: {
        splitLine: {
          lineStyle: {
            type: "dashed",
          },
        },
      },
    };
    chart_initial();
  } else {
    state = "loaded";
    window.parent.document.getElementById("iframe0");
    window.addEventListener("message", onMessage, false);
    window.message = onMessage;
  }
}

window.onload = main;

const chart_initial = async () => {
  try {
    await getCols();
    await handle_data();
    waitUntil(() => {
      onWindowResize();
      if (
        width > 0 &&
        height > 0 &&
        Object.keys(col_rel).length &&
        Object.keys(config).length
      ) {
        if (source?.length) {
          chartDom = document.getElementById("chart-wrapper");
          chart = echarts.init(chartDom);
          init_chart();
          isChartInitialized = true;
        }
        return true;
      }
    });
  } catch (err) {
    console.log("Error :", err);
  }
};
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

// this method is executed when changing the config.

const updateOptionsStyles = () => {
  const options = {
    backgroundColor: config?.chart?.background,
    color: config?.chart?.color,
    title: {
      show: config?.title?.show,
      text: config?.title?.text,
      top: config?.title?.top,
      left: config?.title?.left,
      textStyle: {
        fontSize: config?.title?.fontSize,
        color: config?.title?.color,
      },
      subtextStyle: {
        color: config?.subtext?.color,
        text: config?.subtext?.text,
      },
    },
    tooltip: {
      show: config?.tooltip?.show,
      trigger: config?.tooltip?.trigger,
      triggerOn: config?.tooltip?.triggerOn,
      borderColor: config?.tooltip?.borderColor,
      backgroundColor: config?.tooltip?.backgroundColor,
      formatter: function (params) {
        return `${col_rel?.label} : ${params?.data[col_rel?.label]}<br/>
          ${col_rel?.name}: ${params?.data[col_rel?.name]} <br/>
          ${col_rel?.yValue}: ${params?.data[col_rel?.yValue]} <br/>
          ${col_rel?.xValue}: ${params?.data[col_rel?.xValue]} <br/>
          `;
      },
    },
    legend: {
      show: config?.legend?.show,
      right: config?.legend?.right,
      top: config?.legend?.top,
      icon: "circle",
      itemStyle: {
        color: function (params) {
          return colorList[params.seriesIndex % colorList.length];
        },
      },
      data: [...cols],
    },
    grid: {
      left: config?.grid?.left,
      top: config?.grid?.top,
    },
    xAxis: {
      boundaryGap: true,
      type: "value",
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
      scale: true,
    },
    series: {},
  };
  chart.setOption(options);
};

const init_chart = () => {
  const dataset = [
    {
      source: source,
    },
  ];
  data.map((d) => {
    dataset.push({
      transform: {
        type: "filter",
        config: {
          dimension: col_rel.label,
          value: d.key,
        },
      },
    });
  });
  const series = data.map((d) => {
    return {
      name: d.key,
      type: "scatter",
      colorBy: "series",
      datasetIndex: data.indexOf(d) + 1,
      symbol: config?.chart?.symbol,
      symbolSize: function (val) {
        return Math.sqrt(val[col_rel?.size]) / 5e2;
      },
      selectedMode: config?.chart?.selectedMode,
      itemStyle: {
        shadowBlur: config?.chart?.shadowBlur,
        shadowColor: config?.chart?.shadowColor,
        // (params: Object) => Color
        color: function (params) {
          return colorList[params.seriesIndex % colorList.length];
        },
      },
      select: {
        itemStyle: {
          color: config?.chart?.selectColor,
          borderColor: "transparent",
        },
      },
      emphasis: {
        focus: config?.chart?.focus,
        label: {
          show: true,
          formatter: function (params) {
            return params.data[col_rel?.label];
          },
          position: config?.chart?.labelPosition,
        },
      },
      encode: {
        name: col_rel?.name,
        label: col_rel?.label,
        x: col_rel?.xValue,
        y: col_rel?.yValue,
        size: col_rel?.size,
      },
    };
  });
  option = {
    // timeline: {
    //   autoPlay: true,
    //   realtime: true,
    //   axisType: "category",
    //   controlStyle: {
    //     showNextBtn: false,
    //     showPrevBtn: false,
    //   },
    //   playInterval: 1000,
    //   symbol: "none",
    //   data: function (data) {
    //     console.log(data);
    //     return data.key;
    //   },
    //   // checkpointStyle: {
    //   //   animationDuration: 1000,
    //   //   animationEasing: "linear",
    //   // },
    // },
    legend: {
      data: [...cols],
    },
    series: series,
    dataset: dataset,
  };
  updateOptionsStyles();
  option && chart.setOption(option);
  console.log(option);
};
// this method is executed when changing the data binding.
const change_col = (cols) => {
  init_chart();
};

// this method is executed when changing the config.
const update_config_handler = (newConfig) => {
  let oldConfig = null;
  if (config) {
    oldConfig = { ...config };
  }
  config = newConfig;

  if (!chart) return;
  // todo update option
  // chart
  updateOptionsStyles();
};
// fetch data and convert to standard data chart
// set data to global state
//***
// source = all data
// col = just col(data[0])
// data = all data except for col
//***
const getCols = async () => {
  return new Promise((resolve, reject) => {
    const _t = setInterval(() => {
      if (Object.keys(col_rel).length) {
        clearInterval(_t);
        resolve(true);
      }
    }, 500);
  });
};

const handle_data = async () => {
  try {
    let _data;
    _data = await downloadCsv(datasetUrl);
    const group = d3
      .nest()
      .key(function (d) {
        return d[col_rel?.label];
      })
      .entries(_data)
      .sort(function (a, b) {
        return a.key - b.key;
      })
      .filter((col) => {
        if (col.key !== " " && col.key !== "") {
          return col;
        }
      });
    cols = group.map((col) => col.key);
    source = _data;
    data = group;
  } catch (e) {
    console.log("error in handle data", e);
    return false;
  }
};

////////////// helper
const waitUntil = (callback) => {
  const _t = setInterval(() => {
    const r = callback();
    if (r === true) {
      clearInterval(_t);
    }
  }, 100);
};

function downloadCsv(url) {
  return new Promise((resolve, reject) => {
    // todo
    if (develop) {
      Papa.parse(
        "https://cafedata.io/api/upload/datasets/1645701187844-55a26e10-6be9-44d2-a88f-b0ed1a335235.csv",
        // "https://cafedata.io/api/upload/datasets/1645957878796-d36b6117-5e33-43e7-a1b1-951ce9d19037.csv",
        {
          download: true,
          header: true,
          dynamicTyping: true,
          complete(results, url) {
            resolve(results.data);
          },
          error(err, url) {
            reject(err);
          },
        }
      );
    } else {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete(results, url) {
          resolve(results.data);
        },
        error(err, url) {
          reject(err);
        },
      });
    }
  });
}

function stringToBoll(_value) {
  if (_value === "true") {
    return true;
  } else {
    return false;
  }
}

function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    let context = this,
      args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
