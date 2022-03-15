let option;
let chart;
let chartDom;
let source;
var numericMax = [];
colorList = [
  "rgb(251, 118, 123)",
  "rgba(0, 215, 239, 1)",
  "rgba(255, 228, 52, 0.6)",
  "#77EADF",
  "#26C3BE",
  "#64AFE9",
  "#428BD4",
];

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
    legend: {
      show: config?.legend?.show,
      top: config?.legend?.top,
      selectedMode: config?.legend?.selectedMode,
      data: [...data.cols],
    },
  };
  chart.setOption(options);
};

const init_handler = () => {
  chartDom = document.getElementById("chart-wrapper");
  chart = echarts.init(chartDom);
  console.log("init_handler", {
    width,
    height,
    col_rel,
    config,
    old_config,
    data,
  });
  const indicator = [].concat(col_rel.values).map((value) => {
    return {
      text: value,
      max: 12,
    };
  });

  // series data
  const seriesData = [].concat(data.group).map((value) => {
    return {
      value: (function () {
        const numericValues = [];
        for (let i = 0; i < col_rel.values.length; i++) {
          numericValues.push(value.values[0][col_rel.values[i]]);
          numericMax.push(value.values[0][col_rel.values[i]]);
        }
        return numericValues;
      })(),
      name: value.key,
      lineStyle: {
        type: config?.chart.lineStyle?.type,
        width: config?.chart.lineStyle?.width,
        opacity: config?.chart.lineStyle?.opacity,
      },
      label: {
        show: config?.chart.label?.show,
        fontSize: config?.chart.label?.fontSize,
        position: config?.chart.label?.position,
        formatter: function (params) {
          return params.value;
        },
      },
      areaStyle: {
        color: colorList[Math.floor(Math.random() * colorList.length)],
        opacity: 0.05,
      },
      tooltip: {
        show: config?.chart?.tooltip?.show,
        trigger: "item",
        borderColor: config?.chart?.tooltip?.borderColor,
        backgroundColor: config?.chart?.tooltip?.backgroundColor,
        formatter: function (params) {
          return params.name + ": " + params.value;
        },
      },
    };
  });
  const option = {
    radar: [
      {
        indicator: indicator,
        center: ["50%", "50%"],
        radius: [10, "70%"],
        axisName: {
          formatter: function (value, indicator) {
            return `${value}`;
          },
          color: config?.chart?.axisName?.color,
          backgroundColor: config?.chart?.axisName?.backgroundColor,
          borderRadius: 3,
          padding: [3, 5],
        },
        startAngle: 90,
        splitNumber: col_rel.values.length,
        shape: config?.chart?.radar?.shape,
        splitArea: {
          show: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            type: "solid",
            width: 2,
            opacity: 0.8,
          },
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            opacity: 0.8,
            width: 2,
          },
        },
      },
    ],
    series: [
      {
        data: seriesData,
        type: "radar",
        colorBy: "data",
        symbol: config?.chart?.symbol,
        symbolSize: function (value, indicator) {
          return Math.max(...value);
        },
      },
    ],
  };
  updateOptionsStyles();
  option && chart.setOption(option);
  console.log("init_handler", { option });
};

const change_config_handler = () => {
  if (!chart) return;
  updateOptionsStyles();
};

const transformData = async (newData) => {
  source = newData;
  const group = d3
    .nest()
    .key(function (d) {
      return d[col_rel?.name];
    })
    .entries(newData)
    .sort(function (b, a) {
      return a.key - b.key;
    })
    .filter((col) => {
      if (col.key !== " " && col.key !== "") {
        return col;
      }
    })
    .reverse();
  const cols = group.map((col) => col.key);
  return {
    group,
    cols,
  };
};

const resizeHandler = () => {
  chart?.resize({
    width: width,
    height: height,
  });
};
