// Fonds de carte
var mymap = L.map('map', {
  center: [46.6122, 6.6254],
  zoom: 9,
  maxZoom: 18,
  minZoom: 9,
  maxBounds: L.latLngBounds(L.latLng(46.0, 5.5), L.latLng(47.0, 7.5))
});
var osmLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  
  attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
});
osmLayer.addTo(mymap);

// Interaction
// Cours d'eau se highlight quand on passe au dessus
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
    });
  //layer.bringToFront();
  info.update(layer.feature.properties);
};
// Reset le highlight quand on enlève la souris
function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}
// Zoom sur le cours d'eau cliqué
function zoomToFeature(e) {
  mymap.fitBounds(e.target.getBounds());
};

// Fonction qui regroupe et permet d'ajouter ces fonctions sur chaque cours d'eau
function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
      
  });
};

// Ajouter la couche des cours d'eau
geojson = L.geoJSON(rivieres, {
  onEachFeature: onEachFeature
}).addTo(mymap);



// Graphique
var info = L.control();

info.onAdd = function (mymap) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '';

  if (props) {
    this._div.innerHTML = '<h4>Nombre de capture pour ' + props.NAMN + '</h4>';

    d3.csv("./data/riviere.csv").then(function(data) {
    
      var filteredData = data.filter(function(d) { return d.Riviere === props.NAMN; });

      var parseYear = d3.timeParse("%Y");
      filteredData.forEach(function(d) {

        d.Année = parseYear(d.Année);
        d.Truite = +d.Truite || null;
        d.Vairon = +d.Vairon || null;
        d.Ombre = +d.Ombre || null;
        d.Gardon = +d.Gardon || null;
        d.Perche = +d.Perche || null;
        d.Sandre = +d.Sandre || null;
        d.Chevaine = +d.Chevaine || null;
        d.Brochet = +d.Brochet || null;
        d.Lotte = +d.Lotte || null;
        d.Carp = +d.Carp || null;
        d.Silure = +d.Silure || null;
      });

      var margin = { top: 10, right: 150, bottom: 40, left: 60 },
          width = 600 - margin.left - margin.right,
          height = 250 - margin.top - margin.bottom;

      var svg = d3.select(info._div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom+40)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scaleTime()
        .domain(d3.extent(filteredData, function(d) { return d.Année; }))
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(filteredData.length).tickFormat(d3.timeFormat("%Y")));

      var y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) {
          return Math.max(d.Truite, d.Vairon, d.Ombre, d.Gardon, d.Perche, d.Sandre, d.Chevaine, d.Brochet, d.Lotte, d.Carp, d.Silure);
        })])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      var fishTypes = ["Truite", "Vairon", "Ombre", "Gardon", "Perche", "Sandre", "Chevaine", "Brochet", "Lotte", "Carp", "Silure"];
      var colors = d3.scaleOrdinal(d3.schemePaired).domain(fishTypes);

      fishTypes.forEach(function(fish) {
        svg.append("path")
          .datum(filteredData)
          .attr("fill", "none")
          .attr("stroke", colors(fish))
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function(d) { return x(d.Année); })
            .y(function(d) { return y(d[fish]); })
          )
          .append("title")
          .text(fish);
      });
      // Ajouter une légende 
      var legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (width + 30) + ",-10)"); 

    fishTypes.forEach(function (fish, i) {
      var legendRow = legend.append("g")
        .attr("transform", "translate(0," + (i * 20) + ")");

      legendRow.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 10)
        .attr("y2", 10)
        .attr("stroke", colors(fish))
        .attr("stroke-width", 1.5);

      legendRow.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .text(fish);
    });


    });
  } else {
    this._div.innerHTML = '<h4>Statisitique de pêche</h4>Selectionner une rivière';
  }
};

info.addTo(mymap);

var htmlObject = info.getContainer();
var a = document.getElementById('graph');
function setParent(element, newParent) {
  newParent.appendChild(element);
};
setParent(htmlObject, a)
