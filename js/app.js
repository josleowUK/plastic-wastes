(function () {
  ("use strict");

  // Set heights for page sections
  // adjustHeight();

  const countryGeoJson = d3.json("data/countries.geojson");
  // const countryTopoJson = d3.json("data/countries.topojson");
  const wasteCSV = d3.json("data/waste.json");

  Promise.all([countryGeoJson, wasteCSV]).then(drawMap);

  function drawMap(data) {
    console.log(data);
    // declare a path generator using the projection

    // D3 time
    const mapContainer = d3.select("#map");
    const width = mapContainer.node().offsetWidth - 60;
    const height = mapContainer.node().offsetHeight - 60;

    const svg = mapContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("top", 40)
      .style("left", 30);

    const countryData = data[0];
    console.log(countryData);
    const wasteData = data[1];

    const projection = d3
      .geoNaturalEarth1()
      .fitSize([width, height], countryData);

    const path = d3.geoPath().projection(projection);

    const country = svg
      .append("g")
      .selectAll("path")
      .data(countryData.features)
      .join("path")
      .attr("d", path)
      .attr("class", "country");

    // const countriesGeoJson = topojson.feature(countryData, {
    //   type: "GeometryCollection",
    //   geometries: countryData.objects.ne_50m_admin_0_countries_lakes.geometries,
    // });

    // const counties = svg
    //   .append("g")
    //   .selectAll("path")
    //   .data(countriesGeoJson.features)
    //   .join("path")
    //   .attr("d", path)
    //   .attr("class", "country");

    //loop over countries and join waste data

    // Create  div for the tooltip and hide with opacity
    const tooltip = d3
      .select(".mapSection")
      .append("div")
      .attr(
        "class",
        "my-tooltip bg-success text-white py-1 px-2 rounded position-absolute invisible"
      );

    // when mouse moves over the mapContainer
    mapContainer.on("mousemove", (event) => {
      // update the position of the tooltip
      // console.log(event);
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px");
    });

    // applies event listeners to our polygons for user interaction
    country
      .on("mouseover", (event, d) => {
        // when mousing over an element
        console.log(d);
        d3.select(event.currentTarget).classed("hover", true).raise(); // select it, add a class name, and bring to front
        tooltip.classed("invisible", false).html(d.properties.sovereignt); // make tooltip visible and update info
      })

      .on("mouseout", (event, d) => {
        // when mousing out of an element
        d3.select(event.currentTarget).classed("hover", false); // remove the class from the polygon
        tooltip.classed("invisible", true); // hide the element
      });

    makeZoom(svg, width, height);
  }

  // Utility functions
  window.addEventListener("resize", adjustHeight);

  function adjustHeight() {
    const mapSize = document.querySelector("#map"),
      contentSize = document.querySelector("#content"),
      removeFooter = document.querySelector("#footer").offsetHeight,
      removeHeader = document.querySelector("#header").offsetHeight;
    const resize = window.innerHeight - removeFooter - removeHeader;
    if (window.innerWidth >= 768) {
      contentSize.style.height = `${resize}px`;
      mapSize.style.height = `${resize}px`;
    } else {
      contentSize.style.height = `${resize * 0.25}px`;
      mapSize.style.height = `${resize * 0.75}px`;
    }
  }

  function makeZoom(svg, width, height) {
    const zoom = d3
      .zoom()
      // on zoom (many events fire this event like mousemove, wheel, dblclick, etc.)...
      .on("zoom", (event) => {
        svg
          // select all paths in svg
          .selectAll("path")
          // transform path based on event
          .attr("transform", event.transform)
          // change stroke width on zoom
          .attr("stroke-width", 1 / event.transform.k);
      });

    // Attach function to svg
    svg.call(zoom);
  }

  // When the browser resizes...
  window.addEventListener("resize", () => {
    // remove existing SVG
    d3.selectAll("svg").remove();

    // use promise to call all data files, then send data to callback
    Promise.all([regionGeoJson, countryTopoJson])
      .then(drawMap)
      .catch((error) => {
        console.log(error);
      });
  });
})();
