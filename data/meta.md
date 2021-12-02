# Data source and wrangling process

Data downloaded from (May 14, 2019):

`http://geojson.xyz/` : ne_50m_admin_0_countries_lakes

Counties GeoJSON converted to topojson:

`mapshaper ne_50m_admin_0_countries_lakes.geojson -o format=topojson ne_50m_admin_0_countries_lakes.json`
