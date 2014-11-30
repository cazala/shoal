// MASS MULTIPLIERS - these values represent the relationship between the fish's properties and its mass
var ENERGY = 10,
	MAX_SPEED = 12,
	MAX_FORCE = .1,
	SEPARATION_RANGE = 30,
	LOOK_RANGE = 100,
	SMELL_RANGE = 300,
	LENGTH = 20,
	FERTILITY = .1,
	BITE = .1;

// Fish constructor
function Fish(mass, x, y, hue)
{
	// fish's properties
	this.ID = Fish.uid();
	this.mass = mass > 0 ? mass : -mass;
	this.energy = this.mass * ENERGY;
	this.maxspeed = MAX_SPEED * this.mass;
	this.maxforce = MAX_FORCE / (this.mass * this.mass);
	this.separationRange = this.mass * SEPARATION_RANGE;
	this.lookRange = this.mass * LOOK_RANGE;
	this.smellRange = this.mass * SMELL_RANGE;
	this.length = mass * LENGTH;
	this.base = this.length * .5;
	this.location = new Vector(x, y);
	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.wandering = new Vector(.2,.2);
	this.hue = hue || Math.random() < .5 ? Math.random()*.5 : 1 - Math.random()*.5; // <- the hue is used for color generation and mating
	this.color = Fish.rgb2hex(Fish.hsv2rgb(this.hue, 1, 1));
	this.skin = this.color;
	this.dead = false;
	this.age = 1;
	this.fertility = (this.mass) * FERTILITY + 1;
	this.mature = false;
	this.bite = this.mass * BITE;

	// helper
	this.HALF_PI = Math.PI * .5;
}
(function(){
	var id = 0;
	Fish.uid = function()
	{
		return id++;
	}
})();

// fish's methods
Fish.prototype = {

	// computes all the information from the enviroment and decides in which direction swim
	swim: function(sea)
	{
		// surrounding fishes
		var neighboors = this.look(sea.population, this.lookRange, Math.PI * 2);

		// nearby food
		var nearbyFood = this.look(sea.food, this.smellRange, Math.PI * 2);

		// eat food
		for (var index in nearbyFood)
		{
			var food = nearbyFood[index];
			if (food && !food.dead)
			{
				// go to the food
				this.follow(food.location, food.radius / 10);

				// if close enough...
				if (this.location.dist(food.location) < food.radius)
				{
					// eat the food
					food.eatenBy(this);
				}
			}	
		}

		// find nearby fishes that aren't too big or too small
		var friends = [];
		for (var j in neighboors)
		{
			if (neighboors[j].mass < this.mass * 2 && neighboors[j].mass > this.mass / 2)
				friends.push(neighboors[j]);
		}

		// if any, shoal with them
		if (friends.length)
			this.shoal(friends);
		
		// if nobody is nearby, wander around
		else this.wander(200);
		
		// find nerby fishes that are way bigger than the this fish
		var bigger = [];
		for (var j in neighboors)
		{
			if (neighboors[j].mass > this.mass * 2)
				bigger.push(neighboors[j]);
		}

		// if any, avoid it/them
		if (bigger.length)
			this.avoid(bigger, 300);

		// find nearby fish that are way smaller than the this fish
		var smaller = [];
		for (var j in neighboors)
		{
			if (neighboors[j].mass < this.mass / 2)
				smaller.push(neighboors[j]);
		}

		// if any, chase and eat it/them
		if (smaller.length)
			this.eat(smaller);

		// if the fish is mature enough...
		if (this.mature)
		{
			// find nearby mature fishes
			var mature = [];
			for (var j in neighboors)
				if (neighboors[j].mature)
					mature.push(neighboors[j]);

			// mate with it/them
			this.mate(mature, sea.population);
		}

		// avoid the boundaries of the sea
		this.boundaries(sea);
	},

	// makes the fish avoid a group of fishes
	avoid: function(fishList, dist)
	{
		this.avoidList = fishList;

		for(var i in fishList)
		{
			var d = this.location.dist(fishList[i].location)
			if (d < dist)
			{
				var avoid = fishList[i].location.copy().sub(this.location).mul(-100);
				this.applyForce(avoid);
			}
		}

		if (Fish.showBehavior)
			this.color = "blue";
	},

	// makes the fish chase another group of fishes, and eat them when reaching
	eat: function(fishList)
	{
		this.eatList = fishList;

		var that = this;

		this.chase(fishList, function(fish){
			that.energy += fish.energy;
			fish.energy = 0;
		});

		if (Fish.showBehavior)
			this.color = "red";
	},
	

	// emulates the shoal behaviour
	shoal: function(fishList)
	{
		this.shoalList = fishList;

		// compute vectors
		var separation = this.separate(fishList, this.separationRange).limit(this.maxforce);
		var alignment = this.align(fishList).limit(this.maxforce);
		var cohesion = this.cohesion(fishList).limit(this.maxforce);
		var affinity = this.affinity(fishList);
		
		// shoal with fishes of very different colors won't stay together as tightly as shoals of fishes of the same color
		separation.mul(1.2);
		alignment.mul(1.2 * affinity);
		cohesion.mul(1 * affinity);

		// apply forces
		this.applyForce(separation);
		this.applyForce(alignment);
		this.applyForce(cohesion);

		if (Fish.showBehavior)
			this.color = "black";
	},

	// makes the fish chase a mature fish or a group of mature fishes, and mate with it/them
	mate: function(fishList, seaPopulation)
	{
		this.mateList = fishList;

		var that = this;

		this.chase(fishList, function(fish){

			// set both fishes unable to mate till reaching next fertility threashold
			that.fertility += that.mass;
			that.mature = false;

			fish.fertility += fish.mass;
			fish.mature = false;

			// DNA of the offspring
			var location = that.location.copy().lerp(fish.location, .5);
			var mass = (that.mass + fish.mass) / 2;
			var color = Fish.interpolate(that.hue, fish.hue);

			// mutation
			var mutation_rate = .01;
			mass += Math.random() < mutation_rate ? Math.random() * 2 - 1 : 0;
			color = Math.random() < mutation_rate ? Math.random() : color;

			// create offspring
			var offspring = new Fish(mass, location.x, location.y, color);
			
			// add to sea population
			seaPopulation.push(offspring);
		}, 400);

		if (Fish.showBehavior)
			this.color = "pink";
	},

	// avoid boundaries of the screen
	boundaries: function(sea)
	{
		if (this.location.x < 50)
			this.applyForce(new Vector(this.maxforce*3, 0));

		if (this.location.x > sea.width - 50)
			this.applyForce(new Vector(-this.maxforce*3, 0));

		if (this.location.y < 50)
			this.applyForce(new Vector(0, this.maxforce*3));

		if (this.location.y > sea.height - 50)
			this.applyForce(new Vector(0, -this.maxforce*3));
	},

	// return an array of the nearby fish that are ahead
	look: function (fishList, radius, angle)
	{
		var neighboors = [];
		for (var i in fishList)
			if (fishList[i] != null && fishList[i] != this)
			{
				var diff = this.location.copy().sub(fishList[i].location);
				var a = this.velocity.angleBetween(diff);
				var d = this.location.dist(fishList[i].location);
				if (d < radius && (a < angle/2 || a > Math.PI * 2 - angle/2))
					neighboors.push(fishList[i]);
			}
				
		return neighboors;
	},

	// wander behaviour (when the fish is alone, i.e. it can't see other neighboors around)
	wander: function(radius)
	{
		if (Math.random() < .05) {
			this.wandering.rotate(Math.PI * 2 * Math.random());
		}
		this.velocity.add(this.wandering);

		if (Fish.showBehavior)
			this.color = "gray";
	},

	// makes the fish folow a target (vector)
	follow: function(target, arrive)
	{
			var dest = target.copy().sub(this.location);
			var d = dest.dist(this.location);

			if (d < arrive)
				dest.setMag(d/arrive*this.maxspeed);
			else 
				dest.setMag(this.maxspeed);

			this.applyForce(dest.limit(this.maxforce*2));
	},

	// chase behaviour - makes the fish chase a group of other fishes
	chase: function(fishList, action, force)
	{
		if (fishList.length == 0)
			return;

		for (var i in fishList)
		{
			this.applyForce(fishList[i].attract(this, force || 50));
			if (this.location.dist(fishList[i].location) < (this.length + fishList[i].length)/2)
				action(fishList[i]); // <- execute action when reaching a fish
		}
	},

	// given a target vector, return a vector that would steer the fish in that direction
	seek: function(target)
	{
		var seek = target.copy().sub(this.location);
		seek.normalize();
		seek.mul(this.maxspeed);
		seek.sub(this.velocity).limit(this.maxforce);
		
		return seek;
	},

	// attracts the fish to a desired body 
	attract: function(body, attractionForce)
	{
		var force = this.location.copy().sub(body.location);
	    var distance = force.mag();
	    distance = distance < 5 ? 5 : distance > 25 ? 25 : distance;
	    force.normalize();
	 
	    var strength = (attractionForce * this.mass * body.mass) / (distance * distance);
	    force.mul(strength);
	    return force;
	},

	// makes the fish separate from the surrounding fishes
	separate: function(neighboors, range)
	{
		var sum = new Vector(0,0);

		if (neighboors.length)
		{
			for (var i in neighboors)
			{
				var d = this.location.dist(neighboors[i].location)
				if (d < range)
				{
					var diff = this.location.copy().sub(neighboors[i].location);
					diff.normalize();
					diff.div(d);
					sum.add(diff);
				}
			}	
			sum.div(neighboors.length);
			sum.normalize();
			sum.mul(this.maxspeed);
			sum.sub(this.velocity)
			sum.limit(this.maxforce);
		}

		return sum;
	},

	// aligns the fish to the surrounding fishes
	align: function(neighboors)
	{
		var sum = new Vector(0,0);

		if (neighboors.length)
		{
			for (var i in neighboors)
			{
				sum.add(neighboors[i].velocity);
			}	
			sum.div(neighboors.length);
			sum.normalize();
			sum.mul(this.maxspeed);

			sum.sub(this.velocity).limit(this.maxspeed);
		}

		return sum;
	},

	// moves the fish towards the center of the surrounding fishes
	cohesion: function(neighboors)
	{
		var sum = new Vector(0,0);

		if (neighboors.length)
		{
			for (var i in neighboors)
			{
				sum.add(neighboors[i].location);
			}	
			sum.div(neighboors.length);
			return this.seek(sum);
		}

		return sum;
	},

	// return a coeficient represanting the color affinity in a group of neighboor fishes
	affinity: function(fishList){
		var coef = 0;
		for (var i in fishList)
		{
			var difference = Math.abs(fishList[i].hue - this.hue);
			if (difference > .5)
				difference = 1 - difference;
			coef += difference
		}
		var affinity = 1 - (coef / fishList.length);

		return affinity * affinity;
	},

	// paint the fish on the screen
	draw: function(ctx)
	{

		// get the points to draw the fish
		var angle = this.velocity.angle();

		x1 = this.location.x + Math.cos(angle) * this.base;
		y1 = this.location.y + Math.sin(angle) * this.base;

		x = this.location.x - Math.cos(angle) * this.length;
		y = this.location.y - Math.sin(angle) * this.length;

		x2 = this.location.x + Math.cos(angle + this.HALF_PI) * this.base;
		y2 = this.location.y + Math.sin(angle + this.HALF_PI) * this.base;

		x3 = this.location.x + Math.cos(angle - this.HALF_PI) * this.base;
		y3 = this.location.y + Math.sin(angle - this.HALF_PI) * this.base;

		// draw the behaviour of the fish (lines)
		this.drawBehavior(ctx);

		if (this.energy < 0)
			this.color = "black";

		if (Fish.showBehavior && this.mature)
			this.color = "pink";

		// draw the fish on the canvas
		ctx.lineWidth = 2;
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.quadraticCurveTo(x2,y2,x,y);
		ctx.quadraticCurveTo(x3,y3,x1,y1);
		ctx.stroke();
		ctx.fill();
	},

	// draw what's going on inside the fish's head
	drawBehavior: function(ctx)
	{
		if (Fish.showBehavior)
		{
			var old = ctx.globalAlpha;
			ctx.globalAlpha = .2;

			// draw avoid behaviour
			if (this.avoidList && this.avoidList.length)
			{
				ctx.strokeStyle = "blue";
				ctx.lineWidth = 4;
				ctx.beginPath();
				for(var i in this.avoidList)
				{
					ctx.moveTo(this.location.x, this.location.y);
					ctx.lineTo(this.avoidList[i].location.x, this.avoidList[i].location.y);
				}
				ctx.stroke();
			}

			// draw chase behaviour
			if (this.eatList && this.eatList.length)
			{
				ctx.strokeStyle = "red";
				ctx.lineWidth = 4;
				ctx.beginPath();
				for(var i in this.eatList)
				{
					ctx.moveTo(this.location.x, this.location.y);
					ctx.lineTo(this.eatList[i].location.x, this.eatList[i].location.y);
				}
				ctx.stroke();
			}

			// draw shoal behaviour
			if (this.shoalList && this.shoalList.length)
			{
				ctx.lineWidth = 1;
				ctx.strokeStyle = "black";
				ctx.beginPath();
				for(var i in this.shoalList)
				{
					ctx.moveTo(this.location.x, this.location.y);
					ctx.lineTo(this.shoalList[i].location.x, this.shoalList[i].location.y);
				}
				ctx.stroke();
			}

			// draw mate behaviour
			if (this.mateList && this.mateList.length)
			{
				ctx.lineWidth = 1;
				ctx.strokeStyle = "pink";
				ctx.beginPath();
				for(var i in this.mateList)
				{
					ctx.moveTo(this.location.x, this.location.y);
					ctx.lineTo(this.mateList[i].location.x, this.mateList[i].location.y);
				}
				ctx.stroke();
			}
			
			// clear the lists
			this.avoidList = null;
			this.eatList = null;
			this.shoalList = null;
			this.mateList = null;

			// restore alpha
			ctx.globalAlpha = old;
		} else
			this.color = this.skin;
	},

	// update the fish's position and state
	update: function(sea)
	{
		// move the fish
		this.velocity.add(this.acceleration);
	    this.velocity.limit(this.maxspeed);
	    if(this.velocity.mag() < 3)
	    	this.velocity.setMag(5);

	    this.location.add(this.velocity);
	    this.acceleration.limit(this.maxforce);

	    // spend energy
	    this.energy -= ((this.acceleration.mag() * this.mass) * this.age * this.velocity.mag()) / 100;

	    // die
	    if (this.energy < 0)
	    {
	    	this.dead = true;
	    }

	    // grow older
	    this.age *= 1.00005;
	    this.mature = this.age > this.fertility;

	    // reset acceleration
	    this.acceleration.mul(0);
	},

	// apply all the force vectors to the fish's acceleration
	applyForce: function(f)
	{
		this.acceleration.add(f);
	}
}

// draw behaviour flag
Fish.showBehavior = false;

// Color Utilities
Fish.hex2rgb = function(h)
{
	var hex = h.toString().substr(1);
	var r = parseInt(hex[0] + hex[1], 16);
	var g = parseInt(hex[2] + hex[3], 16);
	var b = parseInt(hex[4] + hex[5], 16);

	return {
		r: r,
		g: g,
		b: b
	}
}
Fish.rgb2hex = function(rgb)
{
	rgb.r |= 0;
	rgb.g |= 0;
	rgb.b |= 0;

	var r = rgb.r.toString(16);
	var g = rgb.g.toString(16);
	var b = rgb.b.toString(16);

	r = r.length == 1 ? "0" + r : r;
	g = g.length == 1 ? "0" + g : g;
	b = b.length == 1 ? "0" + b : b;

	return "#" + r.substr(0,2) + g.substr(0,2) + b.substr(0,2);
}
Fish.hsv2rgb = function (h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}
Fish.hue2hex = function(hue){
	var rgb = Fish.hsv2rgb(hue, 1, 1);
	var hex = Fish.rgb2hex(rgb);
	return hex;
}
Fish.interpolate = function(colorA, colorB)
{
	var interpolation = -1,
		difference = Math.abs(colorA - colorB);

	if (difference > .5)
	{
		interpolation = (colorA > colorB ? colorA : colorB) + (1 - difference) / 2;
		
		if (interpolation > 1)
			interpolation -= 1;

	} else
		interpolation = (colorA + colorB) / 2;

	return interpolation;
}
Fish.random = Math.random();