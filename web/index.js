d3.select(document).on("DOMContentLoaded", () => {

	let width = window.innerWidth - 306
	let height = window.innerHeight - 18 - 60

	let x = d3.time.scale().range([0, width])
	let y = d3.scale.linear().range([height, 0])

	let xAxis = d3.svg.axis().scale(x)
		.orient("bottom")
		.ticks(5)

	let yAxis = d3.svg.axis().scale(y)
		.orient("right")
		.ticks(5)
		.tickSize(width)
		.tickFormat(d3.format(".0%"))


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

		let container = svg.selectAll(".group").data(dataNest)
		let groups = container.enter().append("g").attr("class", "group")

		groups.append("path").attr("class", "line1")
			.attr("d", d => line("a", d.values))
			.style({
				stroke: color("a"),
				fill: "none",
				opacity: .5
			})

		svg.append("g").attr("class", "temp")

		let xa = svg.append("g")
			.attr({
				class: "x axis",
				transform: "translate(0," + height + ")"
			})
			.call(xAxis)
		xa.selectAll("line").filter((d, i) => xa.selectAll("line")[0].length - 1 === i).attr({
			x2: -1,
			x1: -1
		})
		xa.append("text")
			.attr({
				"text-anchor": "end",
				transform: "translate(" + (width) + ",36)"
			})
			.text("Year")

		let ya = svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		ya.selectAll("text")
			.attr({
				x: 0,
				y: -7
			})
		ya.append("text")
			.attr("text-anchor", "start")
			.text("Names starting with given letter")

		events()
	})

	let transition = (gender) => {
		let lines = svg.selectAll(".group").transition().duration(800)

		lines.select("path").attr("d", d => line(gender, d.values))
			.style("stroke", color(gender))
	}

	let highlight = (key) => {
		reset()
		key = key.toLowerCase()
		svg.selectAll(".group path").filter((d, i) => {
			console.log(d)
			return key === d.key
		}).style({
			"stroke-width": 2,
			"opacity": 1
		}).each((d, i) => {
			let mode = d3.select("#filter span.selected")[0][0].id
			let genders = ["a","f","m"]
			genders.forEach((g) => {
				svg.selectAll(".temp").append("path").attr("class", "line1")
				.attr("d", () => line(mode, d.values))
				.style({
					stroke: color(g),
					fill: "none",
					opacity: .4,
					"stroke-width": 2
				}).transition().duration(200).attr("d", () => line(g, d.values))
			})
		})

		d3.selectAll("header span").text(key.toUpperCase())
	}

	let reset = () => {
		svg.selectAll(".group path").style({
			"stroke-width": 1,
			"opacity": .5
		})
		svg.select("header span").text("?")
		svg.select(".temp").selectAll("*").remove()
	}

	let color = g => g === "a" ? "#B61489" : (g === "f" ? "#EE3E47" : "#5B46F6")

	let events = () => {
		d3.selectAll("#filter span").on("click", () => {
			d3.selectAll("#filter span").attr("class", "")
			d3.select(d3.event.target).attr("class", "selected")
			transition(d3.event.target.id)
		})

		svg.selectAll(".group path").on("mouseenter", d => highlight(d.key))
		svg.selectAll(".group path").on("mouseleave", reset)

		d3.selectAll("#description span").on("mouseenter", () => highlight(d3.select(d3.event.target).text()))
		d3.selectAll("#description span").on("mouseleave", reset)

		d3.select("body").on("keydown", () => {
			if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(String.fromCharCode(d3.event.which)) !== -1)
				highlight(String.fromCharCode(d3.event.which))
		})
	}
})