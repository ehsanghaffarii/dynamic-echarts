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
//
let develop = true;
//

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
      name: "Film",
      groupBy: "Genre",
      nestingBy: "Lead Studio",
      filterBy: "Year",
      sizeBy: "Worldwide Gross",
      info: "Profitability",
    };
    config = {
      chart: {
        background: "#fff",
      },
      title: {
        show: true,
        text: "Product categories chart",
        left: "8%",
        top: "3%",
        color: "#020202",
        fontSize: "18",
      },
      subtext: {
        show: true,
        color: "#020202",
        text: "Source: World Bank",
      },
      grid: {
        containLabel: true,
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
    // visualMap: [
    //   {
    //     show: true,
    //     min: 0,
    //     max: 100,
    //     dimension: col_rel?.groupBy,
    //     inRange: {
    //       color: ["#006edd", "#e0ffff"],
    //     },
    //   },
    // ],
  };
  chart.setOption(options);
  console.log("options", options);
};

const init_chart = (seriesData) => {
  const option = {
    // dataset: {
    //   source: source,
    // },
    tooltip: {},
    hoverLayerThreshold: Infinity,
    series: [
      {
        type: "custom",
        progressive: 0,
        coordinateSystem: "none",
        renderItem: () => {
          return {
            type: "group",
            children: [
              {
                type: "circle",
                name: "aaa",
              },
              {
                type: "text",
                name: "bbb",
              },
            ],
          };
        },
        encode: {
          // x: [col_rel?.groupBy, 0],
          // y: [col_rel?.groupBy, 1],
          tooltip: col_rel?.filterBy,
          itemName: col_rel?.name,
        },
        data: data,
      },
    ],
  };

  updateOptionsStyles();
  chart.setOption(option);
  console.log(option);
};
// this method is executed when changing the data binding.
const change_col = (cols) => {
  chart_initial();
  // init_chart();
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
    const groupData = d3
      .nest()
      .key((d) => d[col_rel.filterBy])
      .key((d) => d[col_rel.groupBy])
      .key((d) => d[col_rel.nestingBy])
      .key((d) => d[col_rel.name])
      .entries(_data)
      .sort(function (a, b) {
        return a.key - b.key;
      });
    source = _data;
    data = groupData;
    console.log("data", data);
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
      Papa.parse("./data.csv", {
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
