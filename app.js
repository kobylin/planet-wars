"use strict";

var MAX_CREATE_RATE = 10;


var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update
});

function preload() {
	// game.load.image('planet', 'assets/planet.png');
	game.load.image('ship', 'assets/ship.png');

	game.load.spritesheet('planet', 'assets/planet_spritesheet.png', 150, 150, 150);
	game.time.advancedTiming = true;
}


var ship,
	planetManager;

function create() {
	ship = new Ship();

	var planets = [new Planet({
			point: new Phaser.Point(200, 300),
			numShips: 100,
			enemy: true,
			createRate: 10
		}),
		new Planet({
			point: new Phaser.Point(100, 500),
			numShips: 20,
			enemy: true,
			createRate: 5
		}),
		new Planet({
			point: new Phaser.Point(600, 300),
			numShips: 5,
			createRate: 6
		}), new Planet({
			point: new Phaser.Point(600, 500),
			numShips: 30,
			createRate: 4
		})
	];

	planetManager = new PlanetManager({
		planets: planets
	});
}

function update(e) {
	// console.log(e.time.elapsed);
	ship.update();
	planetManager.update();

	game.debug.text(game.time.fps || '--', 2, 14, 'white', '20px Courier');
}


///////

function Ship() {
	this.sprite = game.add.sprite(100, 100, 'ship');
	this.sprite.scale.setTo(0.2, 0.2);
	this.sprite.anchor.setTo(0.5, 0.5);
	game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
}

Ship.prototype.update = function() {
	var targetAngle = (360 / (2 * Math.PI)) * game.math.angleBetween(
		this.sprite.x, this.sprite.y,
		game.input.activePointer.x, game.input.activePointer.y) + 90;

	// console.log(targetAngle);
	this.sprite.angle = targetAngle;

	game.physics.arcade.moveToPointer(this.sprite, 200);
	if (Phaser.Rectangle.contains(this.sprite.body, game.input.x, game.input.y)) {
		this.sprite.body.velocity.setTo(0, 0);
	}
}

//PLANET
function Planet(options) {
	this.point = options.point || new Phaser.Point(0, 0);
	this.enemy = options.enemy || false;
	this.numShips = options.numShips || 0;
	this.createRate = options.createRate || 3;

	this.selected = false;

	var sprite = this.sprite = game.add.sprite(this.point.x, this.point.y, 'planet');
	sprite.inputEnabled = true;
	sprite.frame = 0;
	sprite.scale.setTo(this.createRate / MAX_CREATE_RATE);

	this.text = game.add.text(
		this.point.x + sprite.width / 2,
		this.point.y + sprite.height / 2 + 3,
		"0", {
			font: "bold 20px Arial",
			fill: "white"
		});
	this.text.anchor.set(0.5);
}

Planet.prototype.update = function() {
	this.text.setText(this.numShips);
	if (this.selected) {
		if (this.enemy) {
			this.sprite.frame = 3;
		} else {
			this.sprite.frame = 1;
		}
	} else {
		if (this.enemy) {
			this.sprite.frame = 2;
		} else {
			this.sprite.frame = 0;
		}
	}
};

Planet.prototype.createShips = function() {
	this.numShips += this.createRate;
}

function PlanetManager(options) {
	var planets = this.planets = options.planets;
	var selectionMode = false;
	var targetPlanet = null;

	game.input.onUp.add(function(e) {
		selectionMode = false;
		runShips();
	});

	game.time.events.loop(Phaser.Timer.SECOND / 2, function() {
		_.each(planets, function(planet) {
			planet.createShips();
		});
	}, this);

	function runShips() {
		_.each(planets, function(planet) {
			planet.selected = false;
		});
	}

	_.each(planets, function(planet) {
		planet.sprite.events.onInputDown.add(function() {
			if (planet.enemy) return;
			selectionMode = true;
			planet.selected = true;
		});

		planet.sprite.events.onInputOver.add(function() {
			if (!selectionMode) return;

			if (planet.enemy) {
				if (targetPlanet) {
					targetPlanet.selected = false;
				}
				targetPlanet = planet;
			} else {
				if (targetPlanet) {
					targetPlanet.selected = false;
					targetPlanet = null;
				}
			}
			planet.selected = true;
		});


	});

}


PlanetManager.prototype.update = function() {
	_.each(this.planets, function(planet) {
		planet.update();
	});
};