let option;
let chart;
let chartDom;
let source;
let renderItem1;

// window.onload = () => {
//   base_first_time({
//     _col_rel: {
//       name: "name",
//       value: "value",
//       path: "path",
//       children: "children",
//     },
//     _config: {},
//     _data: [
//       {
//         value: 40,
//         name: "Accessibility",
//         path: "Accessibility",
//       },
//       {
//         value: 180,
//         name: "Accounts",
//         path: "Accounts",
//         children: [
//           {
//             value: 76,
//             name: "Access",
//             path: "Accounts/Access",
//             children: [
//               {
//                 value: 12,
//                 name: "DefaultAccessPlugin.bundle",
//                 path: "Accounts/Access/DefaultAccessPlugin.bundle",
//               },
//               {
//                 value: 28,
//                 name: "FacebookAccessPlugin.bundle",
//                 path: "Accounts/Access/FacebookAccessPlugin.bundle",
//               },
//               {
//                 value: 20,
//                 name: "LinkedInAccessPlugin.bundle",
//                 path: "Accounts/Access/LinkedInAccessPlugin.bundle",
//               },
//               {
//                 value: 16,
//                 name: "TencentWeiboAccessPlugin.bundle",
//                 path: "Accounts/Access/TencentWeiboAccessPlugin.bundle",
//               },
//             ],
//           },
//           {
//             value: 92,
//             name: "Authentication",
//             path: "Accounts/Authentication",
//             children: [
//               {
//                 value: 24,
//                 name: "FacebookAuthenticationPlugin.bundle",
//                 path: "Accounts/Authentication/FacebookAuthenticationPlugin.bundle",
//               },
//               {
//                 value: 16,
//                 name: "LinkedInAuthenticationPlugin.bundle",
//                 path: "Accounts/Authentication/LinkedInAuthenticationPlugin.bundle",
//               },
//               {
//                 value: 20,
//                 name: "TencentWeiboAuthenticationPlugin.bundle",
//                 path: "Accounts/Authentication/TencentWeiboAuthenticationPlugin.bundle",
//               },
//               {
//                 value: 16,
//                 name: "TwitterAuthenticationPlugin.bundle",
//                 path: "Accounts/Authentication/TwitterAuthenticationPlugin.bundle",
//               },
//               {
//                 value: 16,
//                 name: "WeiboAuthenticationPlugin.bundle",
//                 path: "Accounts/Authentication/WeiboAuthenticationPlugin.bundle",
//               },
//             ],
//           },
//           {
//             value: 12,
//             name: "Notification",
//             path: "Accounts/Notification",
//             children: [
//               {
//                 value: 12,
//                 name: "SPAAccountsNotificationPlugin.bundle",
//                 path: "Accounts/Notification/SPAAccountsNotificationPlugin.bundle",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         value: 36,
//         name: "Assistant",
//         path: "Assistant",
//         children: [
//           {
//             value: 36,
//             name: "Plugins",
//             path: "Assistant/Plugins",
//             children: [
//               {
//                 value: 36,
//                 name: "AddressBook.assistantBundle",
//                 path: "Assistant/Plugins/AddressBook.assistantBundle",
//               },
//               {
//                 value: 8,
//                 name: "GenericAddressHandler.addresshandler",
//                 path: "Recents/Plugins/GenericAddressHandler.addresshandler",
//               },
//               {
//                 value: 12,
//                 name: "MapsRecents.addresshandler",
//                 path: "Recents/Plugins/MapsRecents.addresshandler",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   });
// };

function getLevelOption() {
  return [
    {
      itemStyle: {
        borderWidth: 0,
        gapWidth: 5,
      },
    },
    {
      itemStyle: {
        gapWidth: 1,
      },
    },
    {
      colorSaturation: [0.35, 0.5],
      itemStyle: {
        gapWidth: 1,
        borderColorSaturation: 0.6,
      },
    },
  ];
}

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
  };
  chart.setOption(options);
};

const updateOptions = () => {
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

  const seriesData = data.map((group) => {
    console.log("group", group);
    return {
      name: group.name,
      value: group.value,
      path: group.path,
      // children: group.children?.map((item) => {
      //   return {
      //     name: item.name,
      //     value: item.value,
      //     children: item.children.map((item) => {
      //       return {
      //         name: item.name,
      //         value: item.value,
      //       };
      //     }),
      //   };
      // }),
    };
  });
  const formatUtil = echarts.format;
  option = {
    tooltip: {
      formatter: function (info) {
        var value = info.value;
        var treePathInfo = info.treePathInfo;
        var treePath = [];
        for (var i = 1; i < treePathInfo.length; i++) {
          treePath.push(treePathInfo[i].name);
        }
        return [
          '<div class="tooltip-title">' +
            formatUtil.encodeHTML(treePath.join("/")) +
            "</div>",
          "Disk Usage: " + formatUtil.addCommas(value) + " KB",
        ].join("");
      },
    },
    series: [
      {
        type: "treemap",
        visibleMin: 300,
        label: {
          show: true,
          formatter: config?.label?.formatter,
        },
        itemStyle: {
          borderColor: config?.itemStyle?.borderColor,
        },
        levels: getLevelOption(),
        data: seriesData,
      },
    ],
  };

  option && chart.setOption(option);
  updateOptionsStyles();
  console.log("init_handler", { option });
};

const change_config_handler = () => {
  if (!chart) return;
  updateOptionsStyles();
};

const transformData = async (newData) => {
  return newData;
};

const resizeHandler = () => {
  chart?.resize({
    width: width,
    height: height,
  });
};
