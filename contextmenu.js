function contextmenu(d) {
	//d3.select(".custom_menu").remove();
	d3.event.preventDefault();
	menu = d3
		.select(".custom_menu")
		.style("left", d3.event.pageX + "px")
		.style("top", d3.event.pageY + "px")
		.style("position", "absolute")
		.style("display", "block");

	menu.selectAll("li").on("click", function(e, i) {
		contextOptions(d, i);
	});
}

d3.select("body").on("click", function() {
	d3.select(".custom_menu").style("display", "none");
});

function contextOptions(d, i) {
	switch (i) {
		case 0:
			focus.children.forEach(function(n) {
				if (n.data.name == d.name && n.children) {
					transition(n.parent);
					return;
				}
			});

			searchNodes(root, d.name);
			break;
		case 1:

			generateIncomingSankey(root, d);

			break;
	}
}

function searchNodes(d, s) {
	s = s.toLowerCase();
	console.log(d);
	let alt = d.data.alttitles ? d.data.alttitles: [];
	if (d.data.name == s || alt.includes(s)) {
		transition(d.parent);
		return;
	}
	if (d.children) {
		for (let i in d.children) {
			searchNodes(d.children[i], s);
		}
	}
}

function search(s) {
	searchNodes(root, s);
}

function generateIncomingSankey(d, e){
	let sankeyMap = {
		nodes: [],
		links: []
	};
	sankeyMap.nodes.push({
		name: e.name,
		value: 1
	})
	sankeyMap = getIncoming(sankeyMap, d, e);
	if (sankeyMap.links.size > 0) loadSankey(sankeyMap);

}

function getIncoming(map, d, e){
	console.log(d);
	if( d.data.connections && d.data.connections.includes(e.name)){
		let f = d;
		if(f.depth > e.depth){
        while(f.depth != e.depth){
          f = f.parent;
        }
      }

	let target = 0;
	let originIndex = 0;
    for(i = 0; i < map.nodes.length; i++) {
      if (map.nodes[i].name === f.data.name) {
        originIndex = i;
        if(0 == originIndex && i == map.nodes.length - 1){
          map.nodes.push({ name: f.data.name });
          originIndex = map.nodes.length;
        }
      }
       else if(i == map.nodes.length - 1){
        map.nodes.push({ name: f.data.name });
        originIndex = i+1;
      }

    }

    map.links.push({
      "source": originIndex,
      "target": 0,
      "value": 1
    });

}
	if (d.children) {
		for (let i in d.children) {
			getIncoming(map, d.children[i], e);
		}
	}

	return map;
}