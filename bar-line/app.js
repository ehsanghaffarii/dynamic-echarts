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
let sortedData = {};
let resortData = {};
// todo
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
      date: "Date",
      values: ["Evaporation", "Precipitation", "Temperature"],
      value1: "Evaporation",
      value2: "Precipitation",
      value3: "Temperature",
    };

    config = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: "#999",
          },
        },
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar"] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        data: ["Evaporation", "Precipitation", "Temperature"],
      },
      xAxis: [
        {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisPointer: {
            type: "shadow",
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Precipitation",
          min: 0,
          max: 250,
          interval: 50,
          axisLabel: {
            formatter: "{value} ml",
          },
        },
        {
          type: "value",
          name: "Temperature",
          min: 0,
          max: 25,
          interval: 5,
          axisLabel: {
            formatter: "{value} ??C",
          },
        },
      ],
      series: [
        {
          name: "Evaporation",
          type: "bar",
          tooltip: {
            valueFormatter: function (value) {
              return value + " ml";
            },
          },
        },
      ],
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
  await getCols();
  await handle_data();
  if (source?.length) {
    waitUntil(() => {
      onWindowResize();
      if (
        width > 0 &&
        height > 0 &&
        Object.keys(col_rel).length &&
        Object.keys(config).length
      ) {
        chartDom = document.getElementById("chart-wrapper");
        chart = echarts.init(chartDom);
        init_chart();
        isChartInitialized = true;
        return true;
      }
    });
  }
};

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
// this method is executed when changing the config.

const updateOptionsStyles = () => {
  const options = {
    chart: {
      background: config?.chart?.background,
    },
    title: {
      show: config?.title?.show,
      text: config?.title?.text,
      textStyle: {
        color: config?.title?.textStyle?.color,
        textBorderType: config?.title?.textStyle?.textBorderType,
        align: config?.title?.textStyle?.align,
        // itemGap: config?.title?.textStyle?.itemGap,
      },
    },
    // subtext: {
    //   show: false,
    //   text: 'hi man sd',
    //   color: '#ffffff'
    // },
    // tooltip: {
    //   trigger: 'item',
    //   axisPointer: {
    //     type: config?.tooltip?.axisPointer?.type,
    //   },
    // },
    legend: {
      show: config?.legend?.show,
      orient: config?.legend?.orient,
      align: config?.legend?.align,
      top: config?.legend?.top,
      right: config?.legend?.bottom,
      bottom: config?.legend?.left,
      left: config?.legend?.right,
      textStyle: {
        color: config?.legend?.textStyle?.color,
        fontSize: config?.legend?.textStyle?.fontSize,
      },
      //   padding: config?.legend?.padding,
      //   itemGap: config?.legend?.itemGap
    },
    // grid: {
    //   show: config?.grid?.show,
    // },
    xAxis: {
      name: config?.xAxis?.name,
      position: config?.xAxis?.position,
      inverse: config?.xAxis?.inverse,
      // nameLocation: config?.xAxis?.nameLocation,
      //   type: 'category',
      //   verticalAlign: config?.xAxis?.verticalAlign,
      //   nameTextStyle: {
      //   fontWeight: config?.xAxis?.nameTextStyle?.fontWeight,
      //     fontSize: config?.xAxis?.nameTextStyle?.fontSize,
      //     padding: config?.xAxis?.nameTextStyle?.padding
      //   },
      //   min: config?.xAxis?.min,
      //   max: config?.xAxis?.max,
      //   axisPointer: {
      //     type: config?.xAxis?.axisPointer?.type
      //   }\\
      axisLabel: {
        show: config?.xAxis?.axisLabel?.show,
        color: config?.xAxis?.axisLabel?.color,
        rotate: config?.xAxis?.axisLabel?.rotate,
        interval: Number(config?.xAxis?.axisLabel?.interval),
        margin: config?.xAxis?.axisLabel?.margin,
        hideOverlap: config?.xAxis?.axisLabel?.hideOverlap,
        fontStyle: config?.xAxis?.axisLabel?.fontStyle,
        fontSize: Number(config?.xAxis?.axisLabel?.fontSize),
      },
    },
    yAxis: {
      name: config?.yAxis?.name,
      position: config?.yAxis?.position,
      // nameLocation: config?.yAxis?.nameLocation,
      //   fontWeight: config?.yAxis?.fontWeight,
      //   verticalAlign: config?.yAxis?.verticalAlign,
      //   nameTextStyle: {
      //     fontSize: config?.yAxis?.nameTextStyle?.fontSize,
      //     padding: config?.yAxis?.nameTextStyle?.padding
      //   },
      //   min: config?.yAxis?.min,
      //   max: config?.yAxis?.max,
    },
    series: [
      {
        name: config?.series?.name,
        colorBy: config?.series?.colorBy,
        //   type: "bar",
        showBackground: config?.series?.showBackground,
        backgroundStyle: {
          color: config?.series?.backgroundStyle?.color,
          borderColor: config?.series?.backgroundStyle?.borderColor,
          borderWidth: config?.series?.backgroundStyle?.borderWidth,
          //borderRadius: [config?.series?.backgroundStyle?.borderRadius, config?.series?.backgroundStyle?.borderRadius, config?.series?.backgroundStyle?.borderRadius, config?.series?.backgroundStyle?.borderRadius]
        },
        // itemStyle: {
        //   color: '#5C7BD9',
        //   borderColor: '#5C7BD9',
        //   borderWidth: 0,
        // }
      },
    ],
  };
  chart.setOption(options);
};

// this method is executed when changing the config.
const init_chart = () => {
  // todo init options
  var seriesData = [];
  for (const value in col_rel?.values) {
    seriesData.push({
      name: col_rel?.values[value],
      type: "bar",
    });
  }
  option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ["line", "bar"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      show: true,
      top: "5%",
      data: [col_rel?.value1, col_rel?.value2, col_rel?.value3],
    },
    xAxis: [
      {
        type: "category",
        // data: [...cols],
        axisPointer: {
          type: "shadow",
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: col_rel?.value2,
        min: 0,
        max: 250,
        interval: 50,
        axisLabel: {
          formatter: "{value} ml",
        },
      },
      {
        type: "value",
        name: col_rel?.value3,
        min: 0,
        max: 25,
        interval: 5,
        axisLabel: {
          formatter: "{value} ??C",
        },
      },
    ],
    dataset: {
      source: source,
    },
    series: seriesData,
  };

  option && chart.setOption(option);
  updateOptionsStyles();
  console.log(option);
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
const handle_data = async () => {
  try {
    let _data;
    _data = await downloadCsv(datasetUrl);
    const group = d3
      .nest()
      .key(function (d) {
        return d[col_rel?.date];
      })
      .entries(_data)
      .filter((col) => {
        if (col.key !== " " && col.key !== "") {
          return col;
        }
      });
    // col_rel?.date
    cols = group.map((col) => col.key);
    data = group;
    // col_rel?.value
    const values = data;
    console.log("values", values);
    console.log("data", data);
    source = _data;
    console.log(cols);
  } catch (e) {
    console.log("error in handle data", e);
    return false;
  }
};

// Get Cols
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
