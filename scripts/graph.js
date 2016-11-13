var d3 = require("d3");
var request = require('request'),
        dom = require('node-dom').dom,
        fs = require('fs'),   
        URL = require('url');
        
    var args = require('tav').set({
                    url:{
                    note:'../scripts/index.html'
                    }
                },'node-dom for node.js',true);
 
    var url = URL.parse(args.url);
 
    var req = {uri:url.href};
 
    request(req,function (error, response, page) {
    
        if (!error && response.statusCode == 200) {
            
            var options = { url:url,
                                features: {
                                            FetchExternalResources  : {script:'', img:'', input:'', link:''},
                                            ProcessExternalResources: {script:'',img:'',link:'',input:''},
                                            removeScript: true //Remove scripts for innerHTML and outerHTML output
                                }
            };
            
            window=dom(page,null,options); //global
            
            document=window.document; //global
            
            document.onload=function() {
              var svg1 = document.getElementById('#dataGraph');
var rect = svg1.getBoundingClientRect();
console.log(rect.height);

var modal = $('#myModal');
var span = $(".close")[0];
span.onclick = function() {
    modal.style.display = "none";
}

var svg = d3.select("svg"),
    margin = 10,
    diameter = rect.height,
    g = svg.append("g").attr("transform", "translate(" + rect.width / 2+ "," + rect.height / 2 + ")");


var color = d3.scaleLinear()
    .domain([-1, 2])
    .range(["hsl(6, 79%, 70%)", "hsl(10, 86%, 89%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

function update(jaysean) {

d3.json(jaysean, function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      nodes = pack(root).descendants(),
      view;


  var circle = g.selectAll("circle")
    .data(nodes)
    .enter()
  .filter(function(d){ return d.parent; })
    .append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on("click", 
        function(d) { 
          if(d.depth >= 2 && (focus.depth - d.depth >= -1)) {
            d3.event.stopPropagation();
            modal.style.display = "block";
            $('sms').innerHTML = "";
            for(i = 0; i < d.data.children[0].sms.length; i ++) {
              $('sms').innerHTML += d.data.children[0].sms[i].textmess + "<br/>";
            }
             
         } else if (focus !== d) {
            zoom(d);
            d3.event.stopPropagation(); 
         } else {
            d3.event.stopPropagation();  
        }
        });


  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .style("font-size", function(d) { return "27px";})
      .text(function(d) { return d.data.name; });

  
 var node = g.selectAll("circle,text");

  svg
      .style("background", color(-1))
      .on("click", function() { zoom(root); });

  


  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }



});
}

update('./test.json');


module.exports = function() {
  this.up = function(a) { update(a) };
}

            };
        };
    });



