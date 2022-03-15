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
// todo
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

  state = "loaded";
  window.parent.document.getElementById("iframe0");
  window.addEventListener("message", onMessage, false);
  window.message = onMessage;
}

window.onload = main;

const chart_initial = async () => {
  try {
    await getCols();
    await handle_data();
    waitUntil(() => {
      onWindowResize();
      if (width > 0 && height > 0 && Object.keys(config).length) {
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
    console.log(err);
  }
};
///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

// this method is executed when changing the config.

const updateOptionsStyles = () => {
  const options = {
    backgroundColor: config?.chart?.background,
    title: {
      show: config?.title?.show,
      text: config?.title?.text,
      subtext: config?.subtext?.text,
      left: config?.title?.align,
      textStyle: {
        textBorderType: config?.title?.textBorderType,
        color: config?.title?.color,
      },
      subtextStyle: {
        color: config?.subtext?.color,
      },
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: config?.legend?.show,
      orient: config?.legend?.orient,
      left: config?.legend?.align,
      padding: Number(config?.legend?.padding),
      itemGap: Number(config?.legend?.itemGap),
    },
    series: [
      {
        roseType: stringToBoll(config?.chart?.type),
        radius: [
          `${config?.chart?.internalRadius}%`,
          `${config?.chart?.externalRadius}%`,
        ],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: config?.chart?.borderRadius,
          borderColor: config?.chart?.borderColor,
          borderWidth: config?.chart?.borderWidth,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  chart.setOption(options);
};

const init_chart = () => {
  // todo init options
  const options = data.map((d) => {
    console.log("hi man");
    return {
      dataset: {
        source: d.values,
      },
    };
  });
  option = {
    timeline: {
      autoPlay: true,
      realtime: true,
      axisType: "category",
      controlStyle: {
        showNextBtn: false,
        showPrevBtn: false,
      },
      playInterval: 1000,
      symbol: "none",
      data: [...cols],
      // checkpointStyle: {
      //   animationDuration: 1000,
      //   animationEasing: 'linear'
      // },
    },
    series: [
      {
        type: "pie",
        encode: {
          value: col_rel?.values,
          itemName: col_rel?.labels,
        },
      },
    ],
    options: options,
  };
  option && chart.setOption(option);
  updateOptionsStyles();
};
// this method is executed when changing the data binding.
const change_col = (cols) => {
  chart_initial();
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
        return d[col_rel?.rowFilter];
      })
      .entries(_data)
      .sort(function (b, a) {
        return a.key - b.key;
      })
      .filter((col) => {
        console.log(col);
        if (col.key !== " " && col.key !== "") {
          return col;
        }
      })
      .reverse();
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
  }, 500);
};

function downloadCsv(url) {
  return new Promise((resolve, reject) => {
    // todo

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
