var width = 1000;
var height = 500;

var container = d3.select("#mapContainer");

var flowMap = d3
  .select("#flowMap")
  .attr("width", width)
  .attr("height", height)
  .style("background", "#AFEEEE");

var proportionalMap = d3
  .select("#proportionalMap")
  .attr("width", width)
  .attr("height", height)
  .style("background", "#AFEEEE");

var connectionsData = [];

var connectionPaths;

var curveFunction = function (source, target) {
  var dx = target.x - source.x,
    dy = target.y - source.y,
    dr = Math.sqrt(dx * dx + dy * dy);

  return (
    "M" +
    source.x +
    "," +
    source.y +
    "A" +
    dr +
    "," +
    dr +
    " 0 0,1 " +
    target.x +
    "," +
    target.y
  );
};

d3.json("datasets/world-map.geojson")
  .then(function (worldMap) {
    var projection = d3.geoMercator().fitSize([width, height], worldMap);
    var path = d3.geoPath().projection(projection);

    d3.json("datasets/visa-data.json")
      .then(function (visaData) {
        flowMap
          .selectAll("path")
          .data(worldMap.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "country")
          .attr("fill", "#FFB6C1")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            var countryName = d.properties.name;
            showTooltip(event.pageX, event.pageY, countryName);
          })
          .on("mouseout", function () {
            hideTooltip();
          })
          .on("click", function (event, d) {
            var clickedCountry = d.properties.name;
            updateInfoContainer(clickedCountry, worldMap, visaData);

            var filteredConnections = connectionsData.filter(function (
              connection
            ) {
              return (
                connection.sourceCountry === clickedCountry ||
                connection.targetCountry === clickedCountry
              );
            });

            connectionPaths.attr("visibility", function (d) {
              return filteredConnections.includes(d) ? "visible" : "hidden";
            });
          });

        var zoomScale = 0.5;

        proportionalMap
          .selectAll("path")
          .data(worldMap.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "country")
          .attr("fill", "#FFB6C1")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            var countryName = d.properties.name;
            showTooltip(event.pageX, event.pageY, countryName);
          })
          .on("mouseout", function () {
            hideTooltip();
          })
          .on("click", function (event, d) {
            var clickedCountry = d.properties.name;
            updateInfoContainer(clickedCountry, worldMap, visaData);
          });

        function updateInfoContainer(countryName, worldMap, visaData) {
          var infoContainer = document.getElementById("infoContainer");
          var countryData = visaData.find(function (d) {
            return d.country_name === countryName;
          });

          if (!countryData) {
            var countryProperties = worldMap.features.find(function (feature) {
              return feature.properties.name === countryName;
            });

            var countryNameElement = document.getElementById("countryName");
            var outgoingElement = document.getElementById("outgoing");
            var gdpElement = document.getElementById("gdp");
            var incomingElement = document.getElementById("incoming");
            var numberElement = document.getElementById("number");

            countryNameElement.textContent = countryName;
            outgoingElement.textContent = "Outgoing Tourists: ???";
            gdpElement.textContent = "GDP per Capita: ???";
            incomingElement.textContent = "Incoming Tourists: ???";
            numberElement.textContent = "Number of Connections: 0";
          } else {
            var countryNameElement = document.getElementById("countryName");
            var outgoingElement = document.getElementById("outgoing");
            var gdpElement = document.getElementById("gdp");
            var incomingElement = document.getElementById("incoming");
            var numberElement = document.getElementById("number");

            countryNameElement.textContent = countryData.country_name;
            outgoingElement.textContent = `Outgoing Tourists: ${
              countryData.outgoing || "???"
            }`;
            gdpElement.textContent = `GDP per Capita: ${
              countryData.gdp_percapita + " $" || "???"
            }`;
            incomingElement.textContent = `Incoming Tourists: ${
              countryData.incoming || "???"
            }`;
            numberElement.textContent = `Number of Connections: ${
              countryData.connections.length || 0
            }`;
          }
        }

        proportionalMap
          .selectAll("circle")
          .data(visaData)
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            return projection([d.long, d.lat])[0];
          })
          .attr("cy", function (d) {
            return projection([d.long, d.lat])[1];
          })
          .attr("r", function (d) {
            return Math.sqrt(d.connections.length) * (1 / zoomScale);
          })
          .attr("class", "country-circle")
          .attr("fill", "steelblue")
          .attr("fill-opacity", 0.5)
          .attr("stroke", "steelblue")
          .attr("stroke-opacity", 1)
          .on("mouseover", function (event, d) {
            var countryName = d.country_name;
            showTooltip(event.pageX, event.pageY, countryName);
          })
          .on("mouseout", function () {
            hideTooltip();
          })
          .on("click", function (event, d) {
            var clickedCountry = d.country_name;
            updateInfoContainer(clickedCountry, worldMap, visaData);
          });

        visaData.forEach(function (d) {
          var sourceCoords = projection([d.long, d.lat]);

          d.connections.forEach(function (country) {
            var target = visaData.find(function (d) {
              return d.country_name === country;
            });

            if (target) {
              var targetCoords = projection([target.long, target.lat]);

              connectionsData.push({
                source: {
                  x: sourceCoords[0],
                  y: sourceCoords[1],
                },
                target: {
                  x: targetCoords[0],
                  y: targetCoords[1],
                },
                sourceCountry: d.country_name,
                targetCountry: target.country_name,
              });
            } else {
              console.log("Target country not found:", country);
            }
          });
        });

        connectionPaths = flowMap
          .selectAll(".connection")
          .data(connectionsData)
          .enter()
          .append("path")
          .attr("class", "connection")
          .attr("d", function (d) {
            return curveFunction(d.source, d.target);
          })
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-opacity", 1)
          .attr("stroke-width", Math.sqrt(1 / zoomScale))
          .attr("visibility", "hidden");
      })
      .catch(function (error) {
        console.error("Error loading visa data:", error);
      });
  })
  .catch(function (error) {
    console.error("Error loading world map data:", error);
  });

var mapSwitcher = document.getElementById("mapSwitcher");
var flowMapElement = document.getElementById("flowMap");
var proportionalMapElement = document.getElementById("proportionalMap");

mapSwitcher.addEventListener("change", function () {
  var selectedMapType = document.querySelector(
    'input[name="mapType"]:checked'
  ).value;

  if (selectedMapType === "flow") {
    flowMapElement.classList.remove("hidden");
    proportionalMapElement.classList.add("hidden");
  } else if (selectedMapType === "proportional") {
    flowMapElement.classList.add("hidden");
    proportionalMapElement.classList.remove("hidden");
  }
});

function showTooltip(x, y, text) {
  var tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = text;
  tooltip.style.left = event.pageX + "px";
  tooltip.style.top = event.pageY + "px";
  tooltip.style.display = "block";
}

function hideTooltip() {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}

var zoom = d3.zoom().on("zoom", zoomed);
flowMap.call(zoom);
proportionalMap.call(zoom);

function zoomed(event) {
  zoomScale = event.transform.k;
  flowMap.selectAll(".country").attr("transform", event.transform);
  proportionalMap.selectAll(".country").attr("transform", event.transform);
  proportionalMap
    .selectAll(".country-circle")
    .attr("transform", event.transform)
    .attr("r", function (d) {
      return Math.sqrt(d.connections.length) * (1 / zoomScale) * 2.5;
    });
  connectionPaths
    .attr("transform", event.transform)
    .attr("stroke-width", function (d) {
      return Math.sqrt(1 / zoomScale);
    });
}

document.getElementById("zoomInButton").addEventListener("click", function () {
  var currentTransform = d3.zoomTransform(flowMap.node());
  var newScale = currentTransform.k * 1.2;
  var newTransform = d3.zoomIdentity
    .translate(currentTransform.x - 100, currentTransform.y - 50)
    .scale(newScale);
  flowMap.transition().duration(300).call(zoom.transform, newTransform);
  proportionalMap.transition().duration(300).call(zoom.transform, newTransform);
});

document.getElementById("zoomOutButton").addEventListener("click", function () {
  var currentTransform = d3.zoomTransform(flowMap.node());
  var newScale = currentTransform.k / 1.2;
  var newTransform = d3.zoomIdentity
    .translate(currentTransform.x + 50, currentTransform.y + 25)
    .scale(newScale);
  flowMap.transition().duration(300).call(zoom.transform, newTransform);
  proportionalMap.transition().duration(300).call(zoom.transform, newTransform);
});
