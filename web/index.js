document.addEventListener("DOMContentLoaded", function(event) {
	init()
})

var init = () => {
	d3.csv("vornamen.csv", function(d) {
		return {
			year: new Date(+d.year, 0, 1),
			gender: d.gender,
			letter: d.letter,
			contains: +d.contains,
			starts: +d.starts
		}
	}, function(err, data) {
		if (err) throw err

		drawChart(data)
	})
}

var drawChart = (data) => {
	let width = 700
	let height = 500

	let svg = d3.select('body').append('svg')
		.attr({
			width: width + 80,
			height: height + 80
		})
		.append("g")
		.attr("transform", "translate(" + 40 + "," + 40 + ")");


	let x = d3.time.scale()
		.range([0, width])

	x.domain(d3.extent(data, function(d) {
		return d.year;
	}))

	let y = d3.scale.linear()
		.range([height, 0])

	y.domain(d3.extent(data, function(d) {
		return d.contains;
	}))

	let line = d3.svg.line()
		// .interpolate("basis")
		.x(function(d) {
			return x(d.year)
		})
		.y(function(d) {
			return y(d.contains)
		})

	let line2 = d3.svg.line()
		.x(function(d) {
			return x(d.year)
		})
		.y(function(d) {
			return y(d.starts)
		})

	let lines = svg.selectAll("g")
		.data(data)



	var dataNest = d3.nest()
		.key(function(d) {
			return d.letter;
		})
		.entries(data);

	dataNest.forEach(function(d) {

		var dl = svg.append("g").attr("class", "group")

		dl.append("path")
			.attr("class", "line")
			.attr("d", line(d.values))
			.style({
				stroke: "#c3c3FF",
				fill: "none"
			})

		// dl.append("path")
		// 	.attr("class", "line")
		// 	.attr("d", line2(d.values))
		// 	.style({
		// 		stroke: "#ffc3c3",
		// 		fill: "none"
		// 	})

	});

	var xAxis = d3.svg.axis().scale(x)
		.orient("bottom").ticks(5)

	var yAxis = d3.svg.axis().scale(y)
		.orient("left").ticks(5);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height + 4.5) + ")")
		.call(xAxis);

	// Add the Y Axis
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(-2.5,0)")
		.call(yAxis);


	  // var svg2 = d3.select("body").

    // // Make the changes
    //     svg.select(".line")   // change the line
    //         .duration(750)
    //         .attr("d", line2(data));
    //     svg.select(".x.axis") // change the x axis
    //         .duration(750)
    //         .call(xAxis);
    //     svg.select(".y.axis") // change the y axis
    //         .duration(750)
    //         .call(yAxis);

     dataNest.forEach(function(d) {

		var dl = svg.selectAll(".group").transition().duration(1750)

		// dl.append("path")
		// 	.attr("class", "line")
		// 	.attr("d", line(d.values))
		// 	.style({
		// 		stroke: "#c3c3FF",
		// 		fill: "none"
		// 	})

		dl.select("path")
			.attr("class", "line")
			.attr("d", line2(d.values))
			.style({
				stroke: "#ffc3c3",
				fill: "none"
			})

	});


	// lines.enter()
	// 	.append("circle")
	// 	.attr({
	// 		cx: (d, i) => {
	// 			return 10 * i
	// 		},
	// 		cy: 50,
	// 		r: (d, i) => {
	// 			return i
	// 		},
	// 		fill: "#c3c3c3"
	// 	})

	// lines.enter()
	// 	.append("path")
	// 	.attr("class", "line")
	// 	.attr("d", line)
	// 	.style("stroke", "#c3c3c3")
}