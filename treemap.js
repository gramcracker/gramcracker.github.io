/**
 * Interactive, zoomable treemap, using D3 v4
 *
 * A port to D3 v4 of Jacques Jahnichen's Block, using the same budget data
 * see: http://bl.ocks.org/JacquesJahnichen/42afd0cde7cbf72ecb81
 *
 * Author: Guglielmo Celata
 * Date: sept 1st 2017
 **/
let el_id = 'treemapChart';
let viewDepth = 0;
let obj = document.getElementById(el_id);
let divWidth = obj.offsetWidth;
var margin = {
    top: 25
  },
width = divWidth - 1,
height = 200 - margin.top,
formatNumber = d3.format(","),
transitioning;

// sets x and y scale to determine size of visible boxes
var x = d3.scaleLinear().domain([0, width]).range([0, width]);

var y = d3.scaleLinear().domain([0, height]).range([0, height]);
// adding a color scale
var colorwheel = 0;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var treemap = d3.treemap().size([width, height]).paddingInner(0).round(false);

var svg = d3.select('#' + el_id)
.append("svg").attr("id", "treemap")
.attr("width", width)
.attr("height", height + margin.top)
.append("g").attr("transform", "translate(0," + margin.top + ")")
.style("shape-rendering", "crispEdges");

var grandparent = svg.append("g")
.attr("class", "grandparent");

grandparent.append("rect")
.attr("y", -margin.top).attr("width", width)
.attr("height", margin.top).attr("fill", '#bbbbbb');

grandparent.append("text")
.attr("x", 6).attr("y", 6 - margin.top)
.attr("dy", ".75em");

d3.json("whitematter.json", function(data) {
  var root = d3.hierarchy(data);
  treemap(root.sum(function(d) {
    return d.value;
  }).sort(function(a, b) {
    return b.height - a.height || b.value - a.value
  }));
  display(root);

  function display(d) {
    // write text into grandparent
    // and activate click's handler
    grandparent.datum(d.parent).on("click", transition).select("text").text(name(d));
    // grandparent color
    grandparent.datum(d.parent).select("rect").attr("fill", function() {
      return 'grey'
    });
    var g1 = svg.insert("g", ".grandparent").datum(d).attr("class", "depth");
    var g = g1.selectAll("g").data(d.children).enter().append("g");

    // add class and click handler to all g's with children
    g.filter(function(d) {
      return d.children;
      
    }).classed("children", true).on("click", transition);
    g.selectAll(".child").data(function(d) {
      return d.children || [d];
    }).enter().append("rect").attr("class", "child").call(rect);
    // add title to parents
    g.append("rect").attr("class", "parent").call(rect).append("title").text(function(d) {
      return d.data.name;
    });
    /* Adding a foreign object instead of a text object, allows for text wrapping */
    g.append("foreignObject").call(rect).attr("class", "foreignobj").append("xhtml:div").attr("dy", ".75em").html(function(d) {
      return '' + '<p class="title"> ' + d.data.name + '</p>' + '<p>' + formatNumber(d.value) + '</p>';
    }).attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS

    generateSankey(d);

    function transition(d) {

      generateSankey(d);

      
      if (transitioning || !d) return;
      transitioning = true;
      var g2 = display(d),
        t1 = g1.transition().duration(650),
        t2 = g2.transition().duration(650);
      // Update the domain only after entering new elements.
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);
      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);
      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) {
        return a.depth - b.depth;
      });
      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);
      g2.selectAll("foreignObject div").style("display", "none");
      /*added*/
      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);
      /* Foreign object */
      t1.selectAll(".textdiv").style("display", "none");
      /* added */
      t1.selectAll(".foreignobj").call(foreign);
      /* added */
      t2.selectAll(".textdiv").style("display", "block");
      /* added */
      t2.selectAll(".foreignobj").call(foreign);
      /* added */
      // Remove the old node when the transition is finished.
      t1.on("end.remove", function() {
        this.remove();
        transitioning = false;
      });
    }
    return g;
  }

  function text(text) {
    text.attr("x", function(d) {
      return x(d.x) + 6;
    }).attr("y", function(d) {
      return y(d.y) + 6;
    });
  }

  function rect(rect) {
    colorwheel++;
    rect.attr("x", function(d) {
      return x(d.x0);
    }).attr("y", function(d) {
      return y(d.y0);
    }).attr("width", function(d) {
      return x(d.x1) - x(d.x0);
    }).attr("height", function(d) {
      return y(d.y1) - y(d.y0);
    }).attr("fill", function(d) {
      return color(colorwheel);

    });
  }

  function foreign(foreign) { /* added */
    foreign.attr("x", function(d) {
      return x(d.x0);
    }).attr("y", function(d) {
      return y(d.y0);
    }).attr("width", function(d) {
      return x(d.x1) - x(d.x0);
    }).attr("height", function(d) {
      return y(d.y1) - y(d.y0);
    });
  }

  function name(d) {
    return d.data.name;
  }

  function comb(d, dep, map, ref) {
    if (d.children) {
      for (let i in d.children) comb(d.children[i], dep, map, ref);
    }
    if (d.data.connections) {
      for (let i in d.data.connections) {
        getPath(root, d.data.connections[i], dep, map, ref);
      }
    }
  }

  function getPath(e, element, dep, map, ref) {
    if (e.data.name == element) {
      let f = e;
      for (let i = 1; i <= f.depth - dep; i++) {
        f = f.parent;
      }
      addPath(map, f.data.name, ref);
    }
    if (e.children) {
      for (let i in e.children) getPath(e.children[i], element, dep, map, ref);
    }
  }

  function addPath(map, node2, node1) {
    let target;
    if (!map.nodes.some(n => n.name === node2)) {
      map.nodes.push({
        name: node2
      });
    }
    target = map.nodes.findIndex(n => n.name === node2);
    map.links.push({
      "source": node1,
      "target": target,
      "value": 1
    });
    return map;
  }

  function generateSankey(d){

          var sankeyMap = {
        nodes: [],
        links: []
      };
      if (d.children) {
        for (let i = 0; i < d.children.length; i++) {
          if (!sankeyMap.nodes.some(n => n.name === d.children[i].data.name)) {
            sankeyMap.nodes.push({
              name: d.children[i].data.name
            })
          }
          comb(d.children[i], d.children[i].depth, sankeyMap, i);
        }
      }
      console.log(sankeyMap);
      loadSankey(sankeyMap);

  }

});