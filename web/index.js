d3.select(document).on("DOMContentLoaded", () => {

	let width = window.innerWidth - 306
	let height = window.innerHeight - 18 - 60

	let x = d3.time.scale().range([0, width])
	let y = d3.scale.linear().range([height, 0])

	let line = (gender, data) => {
		var l = d3.svg.line()
			.x((d) => {
				return x(d.year)
			})
			.y((d) => {
				return y(d[gender])
			})
		return l(data)
	}

	let svg = d3.select('svg')
		.attr({
			width: width,
			height: height + 60
		})
		.append("g")
		.attr({
			transform: "translate(0,12)",
			class: "container"
		})

	d3.csv("vornamen.csv", (d) => {
		return {
			year: new Date(+d.year, 0, 1),
			char: d.char,
			f: +d.f,
			m: +d.m,
			a: +d.t
		}
	}, (err, data) => {
		if (err) throw err

		x.domain(d3.extent(data, d => d.year))
		y.domain([0, Math.ceil(d3.max(data, d => d.f) * 100) / 100])

		let dataNest = d3.nest()
			.key(d => d.char)
			.entries(data)

		let p = d3.select(".container").selectAll(".group").data(dataNest)
		let g = p.enter().append("g").attr("class", "group")

		g.append("path").attr("class", "line1")
			.attr("d", (d) => {
				return line("a", d.values)
			})
			.style({
				stroke: color("a"),
				fill: "none",
				opacity: .5
			})

		g.append("path").attr("class", "line2")
			.attr("d", (d) => {
				return line("a", d.values)
			})
			.style({
				stroke: color("a"),
				fill: "none",
				opacity: .0
			})

		g.append("path").attr("class", "line3")
			.attr("d", (d) => {
				return line("f", d.values)
			})
			.style({
				stroke: color("f"),
				fill: "none",
				opacity: .0
			})

		g.append("path").attr("class", "line4")
			.attr("d", (d) => {
				return line("m", d.values)
			})
			.style({
				stroke: color("m"),
				fill: "none",
				opacity: .0
			})


		var xAxis = d3.svg.axis().scale(x)
			.orient("bottom").ticks(5)

		var yAxis = d3.svg.axis().scale(y)
			.tickSize(width)
			.ticks(5)
			.orient("right")
			.tickFormat(d3.format(".0%"))

		var xa = svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)

		xa.selectAll("line").filter((d, i) => xa.selectAll("line")[0].length - 1 === i).attr({
			"x2": -1,
			"x1": -1
		})
		xa.append("text")
			.attr("text-anchor", "end")
			.attr("transform", "translate(" + (width) + ",36)")
			.text("Year")

		var ya = svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(0,0)")
			.call(yAxis)

		ya.selectAll("text")
			.attr("x", 0)
			.attr("y", -7)

		ya.append("text")
			.attr("text-anchor", "start")
			.attr("transform", "translate(0,0)")
			.text("Names starting with given letter")

		d3.select("#filter #f").on("click", () => {
			d3.selectAll("#filter span").attr("class", "")
			d3.selectAll("#filter #f").attr("class", "selected")
			transition("f")
		})
		d3.select("#filter #m").on("click", () => {
			d3.selectAll("#filter span").attr("class", "")
			d3.selectAll("#filter #m").attr("class", "selected")
			transition("m")
		})
		d3.select("#filter #a").on("click", () => {
			d3.selectAll("#filter span").attr("class", "")
			d3.selectAll("#filter #a").attr("class", "selected")
			transition("a")
		})

		d3.selectAll(".group path").on("mouseenter", (d, i) => {
			highlight(d.key)
		})

		d3.selectAll(".group path").on("mouseleave", reset)

		d3.selectAll("#description span").on("mouseenter", () => {
			highlight(d3.select(d3.event.target).text())
		})

		d3.selectAll("#description span").on("mouseleave", reset)

		d3.select("body").on("keydown", () => {
			if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(String.fromCharCode(d3.event.which)) !== -1)
				highlight(String.fromCharCode(d3.event.which))
		})
	})

	let transition = (gender) => {
		let lines = svg.selectAll(".group").transition().duration(800)

		lines.select("path").attr("d", d => line(gender, d.values))
			.style("stroke", color(gender))
	}

	let highlight = (key) => {
		reset()
		key = key.toLowerCase()
		d3.selectAll(".group path").filter((d, i) => {
			return key === d.key
		}).style({
			"stroke-width": 2,
			"opacity": .6
		})
		d3.selectAll(".group path.line1").filter((d, i) => {
			return key === d.key
		}).style({
			"stroke-width": 4,
			"opacity": 1
		})
		d3.selectAll("header span").text(key.toUpperCase())
	}

	reset = () => {
		d3.selectAll(".group path").style({
			"stroke-width": 1,
			"opacity": .0
		})
		d3.selectAll(".group path.line1").style({
			"stroke-width": 1,
			"opacity": .5
		})
		d3.select("header span").text("?")
	}

	let color = g => g === "a" ? "#B61489" : (g === "f" ? "#EE3E47" : "#5B46F6")
})