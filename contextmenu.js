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


function getIncoming(d, s){

	if( d.data.connections.includes(s)){

	}

	if (d.children) {
		for (let i in d.children) {
			getIncoming(d.children[i], s);
		}
	}
}