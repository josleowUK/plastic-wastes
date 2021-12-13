(function () {
  ("use strict");

  // Set heights for page sections
  // adjustHeight();

  // const countryGeoJson = d3.json("data/countries.geojson");
  const countryTopoJson = d3.json("data/countries.topojson");
  const wasteCSV = d3.json("data/waste.json");

  Promise.all([countryTopoJson, wasteCSV]).then(drawMap);

  function drawMap(data) {
    // console.log(data);
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
    const wasteData = data[1];

    // const country = svg
    //   .append("g")
    //   .selectAll("path")
    //   .data(countryData.features)
    //   .join("path")
    //   .attr("d", path)
    //   .attr("class", "country");

    const geojson = topojson.feature(countryData, {
      type: "GeometryCollection",
      geometries: countryData.objects.ne_50m_admin_0_countries_lakes.geometries,
    });

    const projection = d3.geoNaturalEarth1().fitSize([width, height], geojson);

    const path = d3.geoPath().projection(projection);

    // console.log(path);

    const country = svg
      .append("g")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", (d) => {
        // console.log(path(d));
        return path(d);
      })
      .attr("class", "country");

    //loop over countries and join waste data
    //matching country with waste in country.

    // Create  div for the tooltip and hide with opacity
    const tooltip = d3
      .select(".mapSection")
      .append("div")
      .attr(
        "class",
        "my-tooltip text-black py-1 px-2 rounded position-absolute invisible"
      );

    // when mouse moves over the mapContainer
    mapContainer.on("mousemove", (event) => {
      // update the position of the tooltip
      // console.log(event);
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px");
    });

    //join data
    // geojson.features.forEach((g) => {
    //   // console.log(g.properties);
    //   let { properties } = g;
    //   let newProps = wasteData;
    //   g.properties.waste = newProps;
    // });
    // //console.log("test ", geojson);

    //join geojson and csv
    for (let i of geojson.features) {
      // console.log(i);
      for (let j of wasteData) {
        if (i.properties.adm0_a3 == j.iso3c) {
          i.properties.wasteData = j;
          break;
        }
      }
    }
    // console.log("test ", geojson);

    // applies event listeners to our polygons for user interaction
    country
      .on("mouseover", (event, d) => {
        // when mousing over an element
        // console.log(d);
        d3.select(event.currentTarget).classed("hover", true).raise(); // select it, add a class name, and bring to front

        const waste = d.properties.wasteData;
        content =
          `<h2 class="mb-0 pb-0">${d.properties.sovereignt}</h2>` +
          `<strong>Population</strong>: ${waste.population_population_number_of_people}<br>` +
          `<strong>Total wastes generated</strong> ${waste.total_msw_total_msw_generated_tons_year} tons per year<br>` +
          `<strong>Type of composition wastes in Percent below</strong><br>` +
          `<strong>Plastic</strong>: ${waste.composition_plastic_percent} <br>` +
          `<strong>Glass</strong>: ${waste.composition_glass_percent} <br>` +
          `<strong>Metal</strong>: ${waste.composition_metal_percent} <br>` +
          `<strong>Paper & Cardboard</strong>: ${waste.composition_paper_cardboard_percent} <br>` +
          `<strong>Rubber & Leather</strong>: ${waste.composition_rubber_leather_percent} <br>` +
          `<strong>Wood</strong>: ${waste.composition_wood_percent} <br>` +
          `<strong>Garden</strong>: ${waste.composition_yard_garden_green_waste_percent} <br>` +
          `<strong>Organic Food</strong>: ${waste.composition_food_organic_waste_percent} <br>`;
        tooltip.classed("invisible", false).html(content); // make tooltip visible and update info
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
    Promise.all([countryTopoJson, wasteCSV])
      .then(drawMap)
      .catch((error) => {
        console.log(error);
      });
  });
})();
