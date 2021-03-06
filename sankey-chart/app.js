let option;
let chart;
let chartDom;

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

  var nodeData = [];

  data.nodes.map((d) => {
    nodeData.push({
      name: d,
    });
  });

  const link = data.links.map((link) => {
    console.log("link", link);
    return {
      source: link[col_rel.source],
      target: link[col_rel.target],
      value: link[col_rel.value],
    };
  });
  option = {
    series: [
      {
        type: "sankey",
        layout: "none",
        data: nodeData,
        links: link,
        itemStyle: {
          normal: {
            borderWidth: 1,
            borderColor: "#aaa",
          },
        },
        label: {
          normal: {
            show: true,
            textStyle: {
              fontSize: config?.label?.fontSize,
            },
          },
        },
      },
    ],
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
  const group = d3
    .nest()
    .key(function (d) {
      return d[col_rel.name];
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
  console.log("cols", cols);
  console.log("group", group);
  return {
    nodes: cols,
    links: newData,
  };
};

const resizeHandler = () => {
  chart?.resize({
    width: width,
    height: height,
  });
};
