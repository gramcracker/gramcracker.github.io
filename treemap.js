        /**
         * Interactive, zoomable treemap, using D3 v4
         *
         * A port to D3 v4 of Jacques Jahnichen's Block, using the same budget data
         * see: http://bl.ocks.org/JacquesJahnichen/42afd0cde7cbf72ecb81
         *
         * Author: Guglielmo Celata
         * Date: sept 1st 2017
         **/
        var el_id = 'treemapChart';
        var viewDepth=0;

        var obj = document.getElementById(el_id);
        var divWidth = obj.offsetWidth;
        var margin = {top: 25, right: 0, bottom: 0, left: 0},
            width = divWidth-1,
            height = 200 - margin.top,
            formatNumber = d3.format(","),
            colorDomain = [0,       50,       90,        95,       100],
            colorRange = ['#3b87b9','#20c66c','#e6d00d','#e6710d', '#990099'],
            transitioning;
        // sets x and y scale to determine size of visible boxes
        var x = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([0, height])
            .range([0, height]);

        // adding a color scale
        var color = d3.scaleLinear()
          .domain(colorDomain)
          .range(colorRange);

        var treemap = d3.treemap()
                .size([width, height])
                .paddingInner(0)
                .round(false);

        var svg = d3.select('#'+el_id).append("svg")
            .attr("id", "treemap")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .style("margin-left", -margin.left + "px")
            .style("margin.right", -margin.right + "px")
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .style("shape-rendering", "crispEdges");
            

        var grandparent = svg.append("g")
                .attr("class", "grandparent");
            grandparent.append("rect")
                .attr("y", -margin.top)
                .attr("width", width)
                .attr("height", margin.top)
                .attr("fill", '#bbbbbb');
            grandparent.append("text")
                .attr("x", 6)
                .attr("y", 6 - margin.top)
                .attr("dy", ".75em");



        d3.json("whitematter.json", function(data) {
            var root = d3.hierarchy(data);
            treemap(root
                .sum(function (d) {
                    return d.value;
                })
                .sort(function (a, b) {
                    return b.height - a.height || b.value - a.value
                })
            );
            display(root);
            function display(d) {
                // write text into grandparent
                // and activate click's handler

                grandparent
                    .datum(d.parent)
                    .on("click", transition)
                    .select("text")
                    .text(name(d));
                // grandparent color
                grandparent
                    .datum(d.parent)
                    .select("rect")
                    .attr("fill", function () {
                        return 'orange'
                    });
                var g1 = svg.insert("g", ".grandparent")
                    .datum(d)
                    .attr("class", "depth");
                var g = g1.selectAll("g")
                    .data(d.children)
                    .enter()
                    .append("g");

                // add class and click handler to all g's with children
                g.filter(function (d) {
                    return d.children;
                })
                    .classed("children", true)
                    .on("click", transition);
                g.selectAll(".child")
                    .data(function (d) {
                        return d.children || [d];
                    })
                    .enter().append("rect")
                    .attr("class", "child")
                    .call(rect);
                // add title to parents
                g.append("rect")
                    .attr("class", "parent")
                    .call(rect)
                    .append("title")
                    .text(function (d){
                        return d.data.name;
                    });
                /* Adding a foreign object instead of a text object, allows for text wrapping */
                g.append("foreignObject")
                    .call(rect)
                    .attr("class", "foreignobj")
                    .append("xhtml:div")
                    .attr("dy", ".75em")
                    .html(function (d) {
                        return '' +
                            '<p class="title"> ' + d.data.name
                             + '</p>' +
                            '<p>' + formatNumber(d.value) + '</p>'
                        ;
                    })
                    .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS
                function transition(d) {
                  // todo: make new sankey object based on d and send to display sankey function
                  var sankeyMap = {
                    nodes: [{name:d.data.name}],
                    links: []
                  };
                  
                  comb(d, d.depth, sankeyMap);
                  console.log(sankeyMap);

                  //create array of strings with names of children regions and regions that children regions are connected to.
                  
                  //create aray of objects with a source region, target region, and value

                  // sankey
                  // .nodes(obj.regions)
                  // .links(obj.links)
                  // .layout(32);
                  // console.log(sankey)
                  //end todo

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
                    svg.selectAll(".depth").sort(function (a, b) {
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
                    t1.on("end.remove", function(){
                        this.remove();
                        transitioning = false;
                    });
                }
                return g;
            }
            function text(text) {
                text.attr("x", function (d) {
                    return x(d.x) + 6;
                })
                    .attr("y", function (d) {
                        return y(d.y) + 6;
                    });
            }
            function rect(rect) {
                rect
                    .attr("x", function (d) {
                        return x(d.x0);
                    })
                    .attr("y", function (d) {
                        return y(d.y0);
                    })
                    .attr("width", function (d) {
                        return x(d.x1) - x(d.x0);
                    })
                    .attr("height", function (d) {
                        return y(d.y1) - y(d.y0);
                    })
                    .attr("fill", function (d) {
                        return color(parseFloat(d.value/2));
                    });
            }
            function foreign(foreign) { /* added */
                foreign
                    .attr("x", function (d) {
                        return x(d.x0);
                    })
                    .attr("y", function (d) {
                        return y(d.y0);
                    })
                    .attr("width", function (d) {
                        return x(d.x1) - x(d.x0);
                    })
                    .attr("height", function (d) {
                        return y(d.y1) - y(d.y0);
                    });
            }
            function name(d) {
                return breadcrumbs(d) +
                    (d.parent
                    ? " -  Click to zoom out"
                    : " - Click a square to zoom in");
            }
            function breadcrumbs(d) {
                var res = "";
                var sep = " > ";
                d.ancestors().reverse().forEach(function(i){
                    res += i.data.name
                     + sep;
                });
                return res
                    .split(sep)
                    .filter(function(i){
                        return i!== "";
                    })
                    .join(sep);
            }


            function comb(d, dep, map){

              if(d.data.connections){
                for (i in d.data.connections){
                  getPath(root, d.data.connections[i], dep, map);
                }
              }
              if (d.children){
                for (i in d.children)
                  comb(d.children[i], dep, map);
              }
            }
            
            function getPath(e, element, dep, map){
                if (e.data.name == element){
                  var f = e;
                  for (i = 1; i <= f.depth - dep; i++){
                    f = f.parent;
                  }
                  
                  addPath(map, f.data.name);
                
                }

                if (e.children){
                  for (i in e.children)
                    getPath(e.children[i], element, dep, map);
                }
            }

            function addPath(map, node2){
              for ( i in map.nodes){
                
                var target;
                if (map.nodes[i] == node2){
                  target = i;
                }else if(i == map.nodes.length - 1){
                  map.nodes.push({"name":node2});
                  target = i+1;
                }
              }
              map.links.push({"source":0,"target":target,"value":1});
              return map;
            }
            
        });