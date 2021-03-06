var units = "Widgets";

var defaultNodeHeight = 15;

// set the dimensions and margins of the graph
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
	height = 300;

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
	format = function(d) {
	return formatNumber(d) + " " + units;
	};

const neurotransmitters = {
	OTHR : "#121212",
	GLUT : "#80828a",
	GABA : "#873333",
	SERO : "#8c5d5d",
	DOPA : "#4f4a6b",
	ACET : "#6c7356",
	NORE : "#a35a00",
}

function colorLink(s){
	switch(s){
		case "other" || "" || undefined:
		return neurotransmitters.OTHR;
		break;
		case "glutamate":
		return neurotransmitters.GLUT;
		break;
		case "gaba":
		return neurotransmitters.GABA; 
		break;
		case "serotonin":
		return neurotransmitters.SERO;
		break;
		case "dopamine":
		return neurotransmitters.DOPA;
		break;
		case "acetylcholine":
		return neurotransmitters.ACET;
		break;
		case "norepinephrine":
		return neurotransmitters.NORE;
		break;
	}
}


//set the colors for the legend
$("#legend li ").each(function(){
	let s = $(this).text().toLowerCase();
	this.style.color =  colorLink(s);
})

// append the svg object to the body of the page
var svg2 = d3
	.select("#sankeyChart")
	.append("svg")
	.attr("id", "sankey")
	.attr("width", width)
	.attr("height", height + 20);

// Set the sankey diagram properties
var sankey = d3
	.sankey()
	.nodeWidth(5)
	.nodePadding(40)
	.size([width, height]);

var path = sankey.link();

// load the data
function loadSankey(graph) {
	svg2.selectAll("g").remove();

	//uncomment to add filters
	const defs = svg2.append('defs')
	.append("pattern")
		.attr("id","diagonals")
		.attr("width", "8")
		.attr("height","8")
		.attr("patternUnits","userSpaceOnUse")
		.attr("patternTransform", "rotate(45)")
		.append("rect")
		.attr("width","7")
		.attr("height","10")
		.attr("transform","translate(0,0)")
		.attr("fill","white");


	console.log(graph);

	sankey
	.nodes(graph.nodes)
	.links(graph.links)
	.layout(32);

	// add in the links
	var link = svg2
	.append("g")
	.selectAll(".link")
	.data(graph.links)
	.enter()
	.append("path")
	.attr("class", "link")
	.attr("d", path)
	.style("stroke", d => d.color)
	.style("stroke-dasharray", d => d.dashed?"3 1":"")
	.style("stroke-width", d => Math.max(1, d.dy))
	.sort(function(a, b) {
		return d3.descending(a.dy, b.dy);
	});

	// add the link titles
	link.append("title").text(function(d) {
	return d.source.name + " → " + d.target.name;
	});

	// add in the nodes
	var node = svg2
	.append("g")
	.selectAll(".node")
	.data(graph.nodes)
	.enter()
	.append("g")
	.attr("class", "node")
	.attr("transform", function(d) {
	  if (d.value == 0) {
		d.x = 0.0;
		d.dy = defaultNodeHeight;
		if (graph.links.length == 0) {
		  d.dy = height / graph.nodes.length;
		  d.y = d.y * (height / graph.nodes.length);
		}
	  }
	  return "translate(" + d.x + "," + d.y + ")";
	})
	.call(
	  d3
		.drag()
		.subject(function(d) {
		  return d;
		})
		.on("start", function() {
		  this.parentNode.appendChild(this);
		})
		.on("drag", dragmove)
	);

	// add the rectangles for the nodes
	node
	.append("rect")
	.attr("height", function(d) {
	  return Math.max(1, d.dy);
	})
	.attr("width", sankey.nodeWidth())
	.style("fill", function(d) {
	  colorwheel++;
	  d.color = colors(colorwheel);
	  return (d.color);
	})
	.style("stroke-width", 0)
	.append("title")
	.text(function(d) {
	  return d.name + "\n" + format(d.value);
	});

	// add in the title for the nodes
	nodeText = node
	.append("text")
	.attr("x", -6)
	.attr("y", function(d) {
	  return d.dy / 2;
	})
	.attr("dy", ".35em")
	.attr("text-anchor", "end")
	.attr("transform", null)
	.text(function(d) {
	  return d.name;
	})
	.on("contextmenu", function(d) {
	  contextmenu(d);
	})
	.filter(function(d) {
	  return d.x < width / 2;
	})
	.attr("x", 6 + sankey.nodeWidth())
	.attr("text-anchor", "start")
	.style("fill", function(d) {
	  return d.value > 0 ? "black" : "white";
	});

	// the function for moving the nodes
	function dragmove(d) {
	d3.select(this).attr(
	  "transform",
	  "translate(" +
		d.x +
		"," +
		(d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) +
		")"
	);
	sankey.relayout();
	link.attr("d", path);
	}
}
