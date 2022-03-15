let option;
let chart;
let chartDom;
let source;

// window.onload = () => {
//   base_first_time({
//     // Country,Region,YearGDPLife expectancy,Population
//     _col_rel: {
//       name: "Country",
//       color: "Region",
//       xValue: "GDP",
//       yValue: "LifeExpectancy",
//       size: "Population",
//       time: "Year",
//     },
//     _config: {},
//     _data: [],
//   });
// };

const updateOptionsStyles = () => {
  const options = {
    backgroundColor: config?.chart?.background,
    title: [
      {
        text: data.cols[0],
        textAlign: "center",
        left: "63%",
        top: "55%",
        textStyle: {
          fontSize: 100,
        },
      },
      {
        show: config?.title?.show,
        text: config?.title?.text,
        top: config?.title?.top,
        left: config?.title?.left,
        textStyle: {
          fontSize: config?.title?.fontSize,
          color: config?.title?.color,
        },
      },
    ],

    grid: {
      top: config?.grid?.top,
      containLabel: true,
      left: config?.grid?.left,
      right: config?.grid?.right,
    },
    xAxis: {
      type: "log",
      max: 1000000,
      min: 10,
      nameGap: 10,
      splitNumber: 10,
      nameLocation: "middle",
      nameTextStyle: {
        fontSize: 18,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        formatter: "{value}",
      },
    },
    yAxis: {
      type: "value",
      max: 100,
      splitNumber: 10,
      nameTextStyle: {
        fontSize: 18,
      },
      splitLine: {
        show: true,
      },
      axisLabel: {
        formatter: "{value}",
      },
    },
  };
  chart.setOption(options);
  console.log("updateOptionsStyles", options);
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
  var sizeFunction = function (x) {
    var y = Math.sqrt(x / 5e8) + 0.1;
    return y * 30;
  };
  option = {
    animationDurationUpdate: 1500,
    animationEasingUpdate: "quadraticInOut",
    xAxis: {},
    yAxis: {},
    timeline: {
      axisType: "category",
      orient: "vertical",
      autoPlay: true,
      left: null,
      right: 0,
      top: 20,
      bottom: 50,
      width: 55,
      height: null,
      symbol: "none",
      checkpointStyle: {
        borderWidth: 2,
      },
      controlStyle: {
        showNextBtn: false,
        showPrevBtn: false,
      },
      data: [...data.cols],
    },
    series: [
      {
        colorBy: "data",
        type: "scatter",
        itemStyle: {
          opacity: 1,
        },
        data: data.group.map(function (row) {
          const value = row.values;
          const res = [];
          const values = value.map(function (v) {
            res.push(Object.values(v));
          });
          return res;
        }),
      },
    ],
    options: [],
  };
  for (var n = 0; n < [...data?.cols].length; n++) {
    option.options.push({
      title: {
        show: true,
        text: data?.cols[n],
      },
      series: {
        name: data.cols[n],
        type: "scatter",
        data: data.group[n].values.map(function (v) {
          return [
            v[col_rel.xValue],
            v[col_rel.yValue],
            v[col_rel.size],
            v[col_rel.name],
            v[col_rel.color],
          ];
        }),
        symbolSize: function (val) {
          return sizeFunction(val[2]);
        },
      },
    });
  }
  chart.setOption(option);
  updateOptionsStyles();
  console.log("option", option);
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
      return d[col_rel?.time];
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
  console.log("group", group);
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
