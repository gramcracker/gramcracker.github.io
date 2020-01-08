function contextmenu(d){
    //d3.select(".custom_menu").remove();
    d3.event.preventDefault();
    menu = d3.select(".custom_menu")
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
      .style("position","absolute")
      .style("display", 'block');

    menu.selectAll('li')
    .on("click", function(e, i){
    	contextOptions(d, i);

    });

}

d3.select('body').on('click', function() {
  d3.select('.custom_menu').style('display', 'none');
});

function contextOptions(d, i){
	console.log(i);
	switch(i){
		case(0):
		console.log(focus);
		focus.children.forEach(function(n){
			if(n.data.name == d.name){
				transition(n);
			}else{
				console.log(d.name + " not in focus");
			}
		});
		// if (focus.children.some(n => )) {
		// 	transition(n);
		// }else{
		// 	console.log(d.name + " not in focus");
		// }
		break;
		case(1):
		break;
	}
}