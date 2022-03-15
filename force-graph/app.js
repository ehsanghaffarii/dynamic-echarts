let option;
let chart;
let chartDom;
let allData;

// window.onload = () => {
//   base_first_time({
//     _col_rel: {
//       source: "source",
//       value: "value",
//       target: "target",
//       symbolSize: "symbolSize",
//       name: "name",
//       xValue: "x",
//       yValue: "y",
//       category: "category",
//     },
//     _config: {},

//     _data: {
//     },
//   });
// };

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
    animationEasingUpdate: "quinticInOut",
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: config?.legend?.show,
    },
    series: [
      {
        roam: config?.chart?.roam,
        leyout: config?.chart?.layout,
        lineStyle: {
          color: "source",
        },
        label: {
          position: config?.chart?.label?.position,
        },
      },
    ],
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
  const nodes = allData.map((d) => {
    return {
      id: d.id,
      name: d[col_rel.name],
      symbolSize: d[col_rel.size],
      x: d.x,
      y: d.y,
      value: d[col_rel.value],
      category: d[col_rel.category],
    };
  });
  const links = allData.map((d) => {
    return {
      source: d[col_rel.source],
      target: d[col_rel.target],
    };
  });
  const categories = data.group.map((d) => {
    return {
      name: d.key,
    };
  });
  allData.forEach(function (node) {
    console.log("node", node);
    node.symbolSize = 5;
  });
  option = {
    legend: {
      data: allData.map(function (a) {
        return a.name;
      }),
    },
    series: [
      {
        type: "graph",
        layout: "force",
        data: nodes,
        links: links,
        categories: categories,
        roam: true,
        lineStyle: {
          color: "source",
        },
        label: {
          position: "right",
        },
        force: { repulsion: 100 },
      },
    ],
    // options: options,
  };
  chart.setOption(option);
  updateOptionsStyles();
  console.log("option", option);
};

const change_config_handler = () => {
  if (!chart) return;
  updateOptionsStyles();
};

const transformData = async (newData) => {
  allData = newData;
  console.log("allData", allData);
  const group = d3
    .nest()
    .key((d) => d[col_rel.categoryName])
    .entries(newData)
    .filter((d) => d.key !== "" && d.key !== " ");
  const cols = group.map((d) => d.key);
  console.log("group", group);
  return {
    cols,
    group,
  };
};

const resizeHandler = () => {
  chart?.resize({
    width: width,
    height: height,
  });
};
