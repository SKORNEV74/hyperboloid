var game = {
	width: 640,
	height: 360,
	ctx: undefined,
	platform: undefined,
	ball: undefined,
	rows: 4,
	cols: 8,
	running: true,
	score: 0,
	blocks: [],
	sprites: {
		platform: undefined,
		ball: undefined,
		block: undefined
	},
	init: function(){
		var canvas = document.getElementById("mycanvas");
		this.ctx = canvas.getContext("2d");
		this.ctx.font = "20px Arial";
		this.ctx.fillStyle = "#fff";

		window.addEventListener("keydown", function(e){
			if (e.keyCode == 37) {
				game.platform.dx = -game.platform.velocity;
			} else if (e.keyCode == 39) {
				game.platform.dx = game.platform.velocity;
			} else if (e.keyCode == 32) {
				game.platform.releaseBall();
			}
		});
		window.addEventListener("keyup", function(e){
			game.platform.stop();
		});
	},
	load: function(){
		for (var key in this.sprites) {
			this.sprites[key] = new Image();
			this.sprites[key].src = "images/" + key + ".png";
		}
	},
	create: function(){
		for (var row = 0; row < this.rows; row++) {
			for (var col = 0; col < this.cols; col++) {
				this.blocks.push({
					x: 68 * col + 50,
					y: 38 * row + 35,
					width: 64,
					height: 32,
					isAlive: true
				});
			}	
		}
	},
	start: function(){
		this.init();
		this.load();
		this.create();
		this.run();
	},
	render: function(){
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
		this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);

		this.blocks.forEach(function(element){
			if (element.isAlive) {
				this.ctx.drawImage(this.sprites.block, element.x, element.y);
			}
		}, this);

		this.ctx.fillText("SCORE: " + this.score, 15, this.height - 15);
	},
	update: function() {
		if (this.ball.collide(this.platform)) {
			this.ball.bumpPlatform(this.platform);
		}

		if (this.platform.dx) {
			this.platform.move();
		}
		if (this.ball.dx || this.ball.dy) {
			this.ball.move();
		}

		this.blocks.forEach(function(element){
			if (element.isAlive) {
				if (this.ball.collide(element)) {
					this.ball.bumpBlock(element);
				}
			}
		}, this);

		this.ball.checkBounds();
	},
	run: function(){
		this.update();
		this.render();

		if (this.running) {
			window.requestAnimationFrame(function(){
				game.run();
			});
		}
	},
	over: function(message){
		alert(message);
		this.running = false;
		window.location.reload();
	}
};

game.ball = {
	width: 22,
	height: 22,
	x: 360,
	y: 278,
	dx: 0,
	dy: 0,
	velocity: 5,
	jump: function(){
		this.dy = -this.velocity;
		this.dx = -this.velocity;
	},
	move: function(){
		this.x += this.dx;
		this.y += this.dy;
	},
	collide: function(element){
		var x = this.x + this.dx;
		var y = this.y + this.dy;

		if (x + this.width > element.x &&
			x < element.x + element.width &&
			y + this.height > element.y &&
			y < element.y + element.height
			) {
			return true;
		}

		return false;
	},
	bumpBlock: function(block){
		this.dy *= -1;
		block.isAlive = false;
		++game.score;

		if (game.score >= game.blocks.length) {
			game.over("You Win!");
		}
	},
	onTheLeftSide: function(platform){
		return (this.x + this.width / 2) < (platform.x + platform.width / 2)
	},
	bumpPlatform: function(platform){
		this.dy = -this.velocity;
		this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
	},
	checkBounds: function(){
		var x = this.x + this.dx;
		var y = this.y + this.dy;

		if (x < 0) {
			this.x = 0;
			this.dx = this.velocity;
		} else if (x + this.width > game.width) {
			this.x = game.width - this.width;
			this.dx = -this.velocity;
		} else if (y < 0) {
			this.y = 0;
			this.dy = this.velocity;
		} else if (y + this.height > game.height) {
			game.over("Game Over");
		}
	}
};

game.platform = {
	x: 300,
	y: 300,
	velocity: 8,
	dx: 0,
	ball: game.ball,
	width: 160,
	height: 24,
	releaseBall: function(){
		if (this.ball) {
			this.ball.jump();
			this.ball = false;
		}
	},
	move: function(){
		this.x += this.dx;

		if (this.ball) {
			this.ball.x += this.dx;
		}

		var x = this.x + this.dx;

		if (x < 0) {
			this.x = 0;
			this.dx = 0;
			this.ball.x = 60;
			this.ball.dx = 0;
		} else if (x + this.width > game.width) {
			this.x = game.width - this.width;
			this.dx = 0;
			this.ball.x = game.width - 100;
			this.ball.dx = 0;
		}
	},
	stop: function(){
		this.dx = 0;

		if (this.ball) {
			this.ball.dx = 0;
		}
	},
	// checkBounds: function(){
	// 	var x = this.x + this.dx;

	// 	if (x < 0) {
	// 		this.x = 0;
	// 		this.dx = 0;
	// 	} else if (x + this.width > game.width) {
	// 		this.x = game.width - this.width;
	// 		this.dx = 0;
	// 	}
	// }
};

window.addEventListener("load", function(){
	game.start();
});