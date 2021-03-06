let option;
let chart;
let chartDom;
let source;

// window.onload = () => {
//   base_first_time({
//     _col_rel: {
//       name: "name",
//       xValue: "x",
//       yValue: "y",
//     },
//     _config: {},
//     _data: [
//       { name: "cluster3", x: 3.275154, y: 2.957587 },
//       { name: "cluster6", x: -3.344465, y: 2.603513 },
//       { name: "cluster0", x: 0.355083, y: -3.376585 },
//       { name: "cluster1", x: 1.852435, y: 3.547351 },
//       { name: "cluster5", x: -2.078973, y: 2.552013 },
//       { name: "cluster0", x: -0.993756, y: -0.884433 },
//       { name: "cluster2", x: 2.682252, y: 4.007573 },
//       { name: "cluster6", x: -3.087776, y: 2.878713 },
//       { name: "cluster1", x: -1.565978, y: -1.256985 },
//       { name: "cluster2", x: 2.441611, y: 0.444826 },
//       { name: "cluster0", x: -0.659487, y: 3.111284 },
//       { name: "cluster0", x: -0.459601, y: -2.618005 },
//       { name: "cluster2", x: 2.17768, y: 2.387793 },
//       { name: "cluster5", x: -2.920969, y: 2.917485 },
//       { name: "cluster0", x: -0.028814, y: -4.168078 },
//       { name: "cluster3", x: 3.625746, y: 2.119041 },
//       { name: "cluster6", x: -3.912363, y: 1.325108 },
//       { name: "cluster0", x: -0.551694, y: -2.814223 },
//       { name: "cluster2", x: 2.855808, y: 3.483301 },
//       { name: "cluster6", x: -3.594448, y: 2.856651 },
//       { name: "cluster0", x: 0.421993, y: -2.372646 },
//       { name: "cluster1", x: 1.650821, y: 3.407572 },
//       { name: "cluster5", x: -2.082902, y: 3.384412 },
//       { name: "cluster0", x: -0.718809, y: -2.492514 },
//       { name: "cluster1", x: 4.513623, y: 3.841029 },
//       { name: "cluster1", x: -4.822011, y: 4.607049 },
//       { name: "cluster0", x: -0.656297, y: -1.449872 },
//       { name: "cluster1", x: 1.919901, y: 4.439368 },
//       { name: "cluster6", x: -3.287749, y: 3.918836 },
//       { name: "cluster1", x: -1.576936, y: -2.977622 },
//       { name: "cluster6", x: -3.977329, y: 4.900932 },
//       { name: "cluster1", x: -1.79108, y: -2.184517 },
//       { name: "cluster3", x: 3.914654, y: 3.559303 },
//       { name: "cluster1", x: -1.910108, y: 4.166946 },
//       { name: "cluster1", x: -1.226597, y: -3.317889 },
//       { name: "cluster1", x: 1.148946, y: 3.345138 },
//       { name: "cluster5", x: -2.113864, y: 3.548172 },
//       { name: "cluster0", x: 0.845762, y: -3.589788 },
//       { name: "cluster2", x: 2.629062, y: 3.535831 },
//       { name: "cluster1", x: -1.640717, y: 2.990517 },
//       { name: "cluster1", x: -1.881012, y: -2.485405 },
//       { name: "cluster1", x: 4.606999, y: 3.510312 },
//       { name: "cluster1", x: -4.366462, y: 4.023316 },
//       { name: "cluster0", x: 0.765015, y: -3.00127 },
//       { name: "cluster3", x: 3.121904, y: 2.173988 },
//       { name: "cluster0", x: -0.559558, y: -3.840539 },
//       { name: "cluster1", x: 4.376754, y: 4.863579 },
//       { name: "cluster1", x: -1.874308, y: 4.032237 },
//       { name: "cluster0", x: -0.089337, y: -3.026809 },
//       { name: "cluster3", x: 3.997787, y: 2.518662 },
//       { name: "cluster6", x: -3.082978, y: 2.884822 },
//       { name: "cluster0", x: 0.845235, y: -3.454465 },
//       { name: "cluster1", x: 1.327224, y: 3.358778 },
//       { name: "cluster5", x: -2.889949, y: 3.596178 },
//       { name: "cluster0", x: -0.966018, y: -2.839827 },
//       { name: "cluster2", x: 2.960769, y: 3.079555 },
//       { name: "cluster6", x: -3.275518, y: 1.577068 },
//       { name: "cluster0", x: 0.639276, y: -3.41284 },
//     ],
//   });
// };

const updateOptionsStyles = () => {
  const options = {
    chart: {
      background: config?.chart?.background,
    },
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
    grid: {
      left: config?.grid?.left,
      top: config?.grid?.top,
    },
    tooltip: {
      position: "top",
    },
    xAxis: {},
    yAxis: {},
  };
  chart.setOption(options);
  console.log("updateOptionsStyles", options);
};

const init_handler = () => {
  chartDom = document.getElementById("chart-wrapper");
  chart = echarts.init(chartDom);
  echarts.registerTransform(ecStat.transform.clustering);

  var CLUSTER_COUNT = [...data.cols].length;
  // var CLUSTER_COUNT = 6;
  var DIENSIION_CLUSTER_INDEX = 2;
  var COLOR_ALL = [
    "#37A2DA",
    "#e06343",
    "#37a354",
    "#b55dba",
    "#b5bd48",
    "#8378EA",
    "#96BFFF",
  ];
  var pieces = [];
  for (var i = 0; i < CLUSTER_COUNT; i++) {
    pieces.push({
      value: i,
      label: data?.cols[i],
      color: COLOR_ALL[i],
    });
  }
  const s = [];
  data.dd.map((d) => {
    const o = Object.values(d);
    s.push(o);
  });
  option = {
    tooltip: {
      position: "top",
    },
    xAxis: {},
    yAxis: {},
    visualMap: {
      type: "piecewise",
      top: "middle",
      min: 0,
      max: CLUSTER_COUNT,
      left: 10,
      splitNumber: CLUSTER_COUNT,
      dimension: DIENSIION_CLUSTER_INDEX,
      pieces: pieces,
    },
    dataset: [
      {
        source: s,
      },
      {
        transform: {
          type: "ecStat:clustering",
          config: {
            clusterCount: CLUSTER_COUNT,
            outputType: "single",
            outputClusterIndexDimension: DIENSIION_CLUSTER_INDEX,
          },
        },
      },
    ],
    series: {
      type: "scatter",
      encode: {
        tooltip: [0, 1],
      },
      symbolSize: 20,
      itemStyle: {
        borderColor: "#555",
      },
      datasetIndex: 1,
    },
    // options: options,
  };
  updateOptionsStyles();
  chart.setOption(option);
  console.log("option", option);
};

const change_config_handler = () => {
  if (!chart) return;
  updateOptionsStyles();
};

const transformData = async (newData) => {
  source = newData;
  const dd = await source.map((d) => {
    return {
      x: d[col_rel.xValue],
      y: d[col_rel.yValue],
    };
  });
  const group = d3
    .nest()
    .key((d) => d[col_rel.name])
    .entries(newData)
    .sort(function (b, a) {
      return a.key - b.key;
    })
    .filter((col) => {
      if (col.key !== " " && col.key !== "") {
        return col;
      }
    });
  const cols = group.map((col) => col.key);
  return {
    dd,
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
