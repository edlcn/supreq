var hashm = {};

var preqChain = []; // will hold all contributing courses.
var nodeList = []; // will hold all nodes.
var linkList = []; // will hold all edges.

var submit = document.getElementById("submit"); // submit button

var container = document.getElementById("mynetwork");
var options;
var network;

async function fillTable() {
  var file = await fetch("https://edlcn.github.io/supreq/out.txt").then(
    (response) => response.text()
  );

  var lines = file.trim().split("\r\n");

  for (let x of lines) {
    var currentLine = x.split(":");
    hashm[currentLine[0]] = currentLine[1];
  }
  console.log(hashm);
}

function createChain() {
  var initialCourse = document
    .getElementById("course")
    .value.replaceAll(" ", "")
    .toUpperCase();

  var initialCourseList = initialCourse.split(",");
  for (let x of initialCourseList) {
    x = x.trim();
    if (isCourse(x)) {
      var toBeAdded = { id: x, label: x };
      nodeList.push(toBeAdded);
      preqChain.push(x);
    } else {
      for (let y of Object.keys(hashm)) {
        if (stringPart(y) == x.substring(0, stringPart(y).length)) {
          var toBeAdded = { id: y, label: y };
          nodeList.push(toBeAdded);
          preqChain.push(y);
        }
      }
    }
  }

  var andCount = 0;
  var orCount = 0;
  let currentIndex = 0;

  while (currentIndex < preqChain.length) {
    var currentCourse = preqChain[currentIndex];

    if (
      // prereq and ve or icermiyorsa
      !hashm[currentCourse].includes("&") &&
      !hashm[currentCourse].includes("|")
    ) {
      if (hashm[currentCourse] != "None") {
        // preq and ve or icermeyip none degilse.
        if (!preqChain.includes(hashm[currentCourse])) {
          var nodeVersion = {
            id: hashm[currentCourse],
            label: hashm[currentCourse],
          };
          nodeList.push(nodeVersion);
          preqChain.push(hashm[currentCourse]);
        }

        var linkVersion = { from: hashm[currentCourse], to: currentCourse };
        linkList.push(linkVersion);
      }
    } else if (
      hashm[currentCourse].includes("&") &&
      !hashm[currentCourse].includes("|")
    ) {
      // preq and icerip or icermediyse.
      var courseList = hashm[currentCourse].split("&");
      var andVar = {
        id: andKeyGiver(andCount),
        label: "and",
        color: "#FF5A50",
      };
      nodeList.push(andVar);
      for (let x of courseList) {
        x = x.trim();
        if (!preqChain.includes(x)) {
          preqChain.push(x);
          var nodeVersion = { id: x, label: x };
          nodeList.push(nodeVersion);
        }

        var linkVersion = { from: x, to: andKeyGiver(andCount) };
        linkList.push(linkVersion);
      }
      var lastCon = { from: andKeyGiver(andCount), to: currentCourse };
      linkList.push(lastCon);
      andCount += 1;
    } else if (
      !hashm[currentCourse].includes("&") &&
      hashm[currentCourse].includes("|")
    ) {
      var courseList = hashm[currentCourse].split("|");
      var orVar = { id: orKeyGiver(orCount), label: "or", color: "#FF5A50" };
      nodeList.push(orVar);
      for (let x of courseList) {
        x = x.trim();
        if (!preqChain.includes(x)) {
          preqChain.push(x);
          var nodeVersion = { id: x, label: x };
          nodeList.push(nodeVersion);
        }
        var linkVersion = { from: x, to: orKeyGiver(orCount) };
        linkList.push(linkVersion);
      }
      var lastCon = { from: orKeyGiver(orCount), to: currentCourse };
      linkList.push(lastCon);
      orCount += 1;
    } else if (
      hashm[currentCourse].includes("&") &&
      hashm[currentCourse].includes("|")
    ) {
      var innerParanthesis = hashm[currentCourse].indexOf("(");
      var outerParanthesis = hashm[currentCourse].indexOf(")");
      if (
        hashm[currentCourse]
          .substr(innerParanthesis, outerParanthesis - innerParanthesis)
          .includes("&")
      ) {
        var courseList = hashm[currentCourse].split("|");
        var orVar = { id: orKeyGiver(orCount), label: "or", color: "#FF5A50" };
        nodeList.push(orVar);
        for (let x of courseList) {
          x = cutParanthesis(x);
          var innerList = x.split("&");
          if (innerList.length == 1) {
            var trimmedVersion = innerList[0].trim();
            if (!preqChain.includes(trimmedVersion)) {
              preqChain.push(trimmedVersion);
              var nodeVersion = { id: trimmedVersion, label: trimmedVersion };
              nodeList.push(nodeVersion);
            }
            var linkVersion = { from: trimmedVersion, to: orKeyGiver(orCount) };
            linkList.push(linkVersion);
          } else {
            var andVar = {
              id: andKeyGiver(andCount),
              label: "and",
              color: "#FF5A50",
            };
            nodeList.push(andVar);
            for (let y of innerList) {
              y = y.trim();
              if (!preqChain.includes(y)) {
                preqChain.push(y);
                var nodeVersion = { id: y, label: y };
                nodeList.push(nodeVersion);
              }
              var linkVersion = { from: y, to: andKeyGiver(andCount) };
              linkList.push(linkVersion);
            }
            var lastCon = {
              from: andKeyGiver(andCount),
              to: orKeyGiver(orCount),
            };
            linkList.push(lastCon);
            andCount += 1;
          }
        }
        var lastCon = { from: orKeyGiver(orCount), to: currentCourse };
        linkList.push(lastCon);
        orCount += 1;
      } else {
        var courseList = hashm[currentCourse].split("&");
        var andVar = {
          id: andKeyGiver(andCount),
          label: "and",
          color: "#FF5A50",
        };
        nodeList.push(andVar);
        for (let x of courseList) {
          x = cutParanthesis(x);
          var innerList = x.split("|");
          if (innerList.length == 1) {
            var trimmedVersion = innerList[0].trim();
            if (!preqChain.includes(trimmedVersion)) {
              preqChain.push(trimmedVersion);
              var nodeVersion = { id: trimmedVersion, label: trimmedVersion };
              nodeList.push(nodeVersion);
            }
            var linkVersion = {
              from: trimmedVersion,
              to: andKeyGiver(andCount),
            };
            linkList.push(linkVersion);
          } else {
            var orVar = {
              id: orKeyGiver(orCount),
              label: "or",
              color: "#FF5A50",
            };
            nodeList.push(orVar);
            for (let y of innerList) {
              y = y.trim();
              if (!preqChain.includes(y)) {
                preqChain.push(y);
                var nodeVersion = { id: y, label: y };
                nodeList.push(nodeVersion);
              }
              var linkVersion = { from: y, to: orKeyGiver(orCount) };
              linkList.push(linkVersion);
            }
            var lastCon = {
              from: orKeyGiver(orCount),
              to: andKeyGiver(andCount),
            };
            linkList.push(lastCon);
            orCount += 1;
          }
        }
        var lastCon = { from: andKeyGiver(andCount), to: currentCourse };
        linkList.push(lastCon);
        andCount += 1;
      }
    }
    currentIndex += 1;
  }
}

function andKeyGiver(count) {
  return "and" + count;
}

function orKeyGiver(count) {
  return "or" + count;
}

function cutParanthesis(str) {
  return str.replace("(", "").replace(")", "");
}

function linkSetter(course) {
  var stringPart = "";
  var numberPart = "";
  for (let x = 0; x < course.length; x++) {
    if (course[x] <= "Z" && course[x] >= "A") {
      stringPart += course[x];
    } else if (course[x] <= "9" && course[x] >= "0") {
      numberPart += course[x];
    }
  }
  //https://suis.sabanciuniv.edu/prod/bwckctlg.p_disp_course_detail?cat_term_in=202201&subj_code_in=ACC&crse_numb_in=201
  return (
    "https://suis.sabanciuniv.edu/prod/bwckctlg.p_disp_course_detail?cat_term_in=202201&subj_code_in=" +
    stringPart +
    "&crse_numb_in=" +
    numberPart
  );
}

function isCourse(str) {
  if (str[str.length - 1] >= "0" && str[str.length - 1] <= "9") {
    return true;
  }
  return false;
}

function stringPart(str) {
  var stringPart = "";
  for (let x = 0; x < str.length; x++) {
    if (str[x] <= "Z" && str[x] >= "A") {
      stringPart += str[x];
    }
  }
  return stringPart;
}

function setOptions() {
  options = {
    edges: {
      arrows: "to",
      color: "black",
      font: "12px arial #ff0000",
      scaling: {
        label: true,
      },
      shadow: true,
      smooth: true,
    },
    layout: {
      randomSeed: undefined,
      improvedLayout: true,
      clusterThreshold: 150,
      hierarchical: {
        enabled: false,
        levelSeparation: 150,
        nodeSpacing: 100,
        treeSpacing: 200,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
        direction: "UD", // UD, DU, LR, RL
        sortMethod: "hubsize", // hubsize, directed
        shakeTowards: "leaves", // roots, leaves
      },
    },
  };
}

function createDiagram() {
  var nodes = new vis.DataSet(nodeList);
  var edges = new vis.DataSet(linkList);

  network = new vis.Network(container, { nodes: nodes, edges: edges }, options);

  network.on("doubleClick", (params) => {
    if (
      params.nodes[0].substring(0, 3) != "and" &&
      params.nodes[0].substring(0, 2) != "or"
    ) {
      window.open(linkSetter(params.nodes[0]));
    }
  });

  preqChain = [];
  nodeList = [];
  linkList = [];
}

window.addEventListener("load", fillTable);

window.addEventListener("load", setOptions);

submit.addEventListener("click", createChain);

submit.addEventListener("click", createDiagram);
