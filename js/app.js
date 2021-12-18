(function () {
  ("use strict");

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

    const geojson = topojson.feature(countryData, {
      type: "GeometryCollection",
      geometries: countryData.objects.ne_50m_admin_0_countries_lakes.geometries,
    });

    // console.log(geojson);

    // Set which variables to use
    const trash = "total_msw_total_msw_generated_tons_year"
    const population = "population_population_number_of_people"

    // Create empty array for classification
    let dataQuantile = []

    //join geojson and csv
    for (let i of geojson.features) {
      // console.log(i);
      for (let j of wasteData) {
        if (i.properties.adm0_a3 == j.iso3c) {
          i.properties.wasteData = j;
          
          // If variable has values
          if (j[trash] != 'NA') {
            // Push a normalized value to the array
            dataQuantile.push(j[trash]/j[population])
          }
          break;
        } else {
          // If no data or undefined, create a new object and add 'NA
          i.properties.wasteData = {}
          i.properties.wasteData[trash] = 'NA'
        }
      }
  
    }

    // Create color scale for quantile
    const color = d3.scaleQuantile()
    .domain(dataQuantile) 
    .range(["white", "pink", "red"]) // Color range. Add more colors for more classes.

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
      .attr("class", "country") // This style applies to countries missing data.
      .style('fill', d => {
        
        // If country has data, return color scale for normalized value. 
        if (d.properties.wasteData[trash] != 'NA') {
          return color(d.properties.wasteData[trash]/d.properties.wasteData[population]);
        }
      })

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

    

    // applies event listeners to our polygons for user interaction
    country
      .on("mouseover", (event, d) => {
        // when mousing over an element
        // console.log(d);
        d3.select(event.currentTarget).classed("hover", true).raise(); // select it, add a class name, and bring to front

        const waste = d.properties.wasteData;

        content = `<h2 class="mb-0 pb-0">${d.properties.sovereignt}</h2>`;

        if (
          waste.population_population_number_of_people != "NA" ||
          waste.population_population_number_of_people != "undefined"
        ) {
          content += `<strong>Population</strong>: ${waste.population_population_number_of_people}<br>`;
        }

        content +=
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

    // drawLegend(wasteData);
    // drawCountry(geojson);
    // drawLegend(wasteData);
    makeZoom(svg, width, height);
  }

  function drawCountry(geojson) {
    const colorScales = {};
    let range = [];
    geojson.features.forEach((g) => {
      if (g.properties.gdp !== "NA") {
        range.push(+g.properties.gdp);
      } else {
        range.push(0);
      }
    });

    colorScales.all = d3
      .scaleLinear()
      .domain(d3.extent(range))
      .range(["white", "red"]);
  }

  function drawLegend(waste) {
    console.log(waste);
    var legendRectSize = 18;
    var legendSpacing = 4;
    var color = d3.scaleOrdinal(d3.schemeCategory20b);
    var legend = svg
      .selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = (height * color.domain().length) / 2;
        var horz = -2 * legendRectSize;
        var vert = i * height - offset;
        return "translate(" + horz + "," + vert + ")";
      });

    legend
      .append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", color)
      .style("stroke", color);

    legend
      .append("text")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(function (d) {
        //add waste.gdp to display?
        return d;
      });
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
  });
})();
