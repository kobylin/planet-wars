"use strict";

var MAX_SHIPS = 200;


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
	planet1,
	planet2,
	planet3,
	planet4,
	planetManager,
	text,
	bmd;

function create() {
	ship = new Ship();

	planet1 = new Planet(new Phaser.Point(200, 300), 123);
	planet1.enemy = true;

	planet2 = new Planet(new Phaser.Point(600, 300), 50);

	planet3 = new Planet(new Phaser.Point(600, 500), 125);

	planet4 = new Planet(new Phaser.Point(100, 500), 32);
	planet4.enemy = true;

	planetManager = new PlanetManager([planet1, planet2, planet3, planet4]);
}

function update() {
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

function Planet(point, numShips) {
	this.point = point || new Phaser.Point(0, 0);
	this.selected = false;
	this.enemy = false;

	var sprite = this.sprite = game.add.sprite(this.point.x, this.point.y, 'planet');
	sprite.inputEnabled = true;
	sprite.frame = 0;
	sprite.scale.setTo(numShips / MAX_SHIPS);

	this.numShips = numShips;

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

function PlanetManager(planets) {
	this.planets = planets;
	var selectionMode = false;
	var targetPlanet = null;

	game.input.onUp.add(function(e) {
		selectionMode = false;
		runShips();
	});

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