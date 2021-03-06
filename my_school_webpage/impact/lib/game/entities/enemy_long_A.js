ig.module('game.entities.enemy_long_A')
.requires('impact.entity', 'game.entities.pathing_entities', 'game.entities.enemy_entities', 'game.aStar', 'game.warplib', 'game.entities.enemy_destroyed_A', 'impact.sound')
.defines(function()
{
    LongAttack = Enemies.extend(
    {
		name: "ENEMY",
		size: null,
		offset: null,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.A,
		collisionDmg: null,
		radius: null,
		pathRadius: 20,
		moveRadius: 0,
		circleRange: 400, //distance in pixels that the ship will try to stay from the player
		laserSFX: new ig.Sound('media/sounds/laser.*'),
		explosionSFX: new ig.Sound('media/sounds/explosion.*'),
		zIndex: 1000,
		value: null,
		
		weapons: null,
		
        animSheet: null,
        init: function (x, y, settings) {
			if(settings.tier === 1){
				this.initTier1(settings);
			} else 
			if(settings.tier === 2){
				this.initTier2(settings);
			} else
			if(settings.tier === 3){
				this.initTier3(settings);
			}
            		this.addAnim ('blob', 0.1, [0]);
			this.currentAnim = this.anims.blob
			this.game = settings.game;

            		this.parent (x, y, settings);
            		this.findDestination();
		},

		initTier1: function (settings) {
			this.animSheet = new ig.AnimationSheet ('media/tier1long.png', 34, 34);
			this.weapons = [{damage: 150, range: 350, reload: 2, charge: 0, delay: 0.30, fire: 1.0, target:{x: 0, y: 0}}];
			this.armor = 100 + 15 * settings.level;
			this.shieldStrength = 2.0 + 0.3 * settings.level;
			this.weapons[0].damage = 100 + 12 * settings.level;
			this.maxVel.x = 130;
			this.maxVel.y = 130;
			this.size = {x: 34, y: 34};
			this.offset = {x: 0, y: 0};
			this.radius = 16;
			this.collisionDmg = 200;
			this.value = 20 + (settings.level*3);
		},

		initTier2: function (settings) {
			this.animSheet = new ig.AnimationSheet ('media/tier2long.png', 40, 40);
			this.weapons = [{damage: 200, range: 350, reload: 2, charge: 0, delay: 0.30, fire: 1.0, target:{x: 0, y: 0}}];
			this.armor = 200 + 20 * settings.level;
			this.shieldStrength = 4.0 + 0.4 * settings.level;
			this.weapons[0].damage = 200 + 15 * settings.level;
			this.maxVel.x = 100;
			this.maxVel.y = 100;
			this.size = {x: 40, y: 40};
			this.offset = {x: 0, y: 0};
			this.radius = 20;
			this.collisionDmg = 300;
			this.value = 40 + (settings.level*4);
		},

		initTier3: function (settings) {
			this.animSheet = new ig.AnimationSheet ('media/tier3long.png', 46, 50);
			this.weapons = [{damage: 300, range: 350, reload: 2, charge: 0, delay: 0.30, fire: 1.0, target:{x: 0, y: 0}}];
			this.armor = 300 + 25 * settings.level;
			this.shieldStrength = 8.0 + 0.5 * settings.level;
			this.weapons[0].damage = 300 + 20 * settings.level;
			this.maxVel.x = 80;
			this.maxVel.y = 80;
			this.size = {x: 44, y: 44};
			this.offset = {x: 1, y: 3};
			this.radius = 25;
			this.collisionDmg = 500;
			this.value = 60 + (settings.level*5);
		},

		rotate: function () {
			var xDiff = -this.game.player.pos.x - this.game.player.size.x + this.pos.x + this.size.x;
			var yDiff = -this.game.player.pos.y - this.game.player.size.y + this.pos.y + this.size.y;
			var angle = Math.atan(yDiff / xDiff);
			if (xDiff < 0) {
				angle += Math.PI;
			}
			
			this.currentAnim.angle = angle;
		},
        
        update: function () {
			this.newpath = this.move();
            if (this.newpath) {
                this.findDestination();
			}
			this.fire();
			this.rotate();
			this.parent();
		},
		
		fire: function () {
			var playerx = this.game.player.pos.x;
			var playery = this.game.player.pos.y;
			if (inRange(this.pos.x, playerx, this.pos.y, playery, this.weapons[0].range) && this.weapons[0].charge <= 0) {
				this.weapons[0].fire = this.weapons[0].delay;
				this.weapons[0].target.x = this.game.player.pos.x + this.game.player.size.x / 2 + Math.random() * 30 - 15;
				this.weapons[0].target.y = this.game.player.pos.y + this.game.player.size.y / 2 + Math.random() * 30 - 15;
				this.weapons[0].charge = this.weapons[0].reload;
			}
			if (this.weapons[0].charge > 0) {
				this.weapons[0].charge -= 1 / FPS;
			}
			if (this.weapons[0].fire <= this.weapons[0].delay) {
				this.weapons[0].fire -= 1 / FPS;
			}
			if (this.weapons[0].fire <= 0) {
				this.weapons[0].fire = this.weapons[0].delay * 2;
				var settings = {parentShip:this, damage:this.weapons[0].damage, 
								target: this.weapons[0].target, game: this.game, color: enemyLaser, laserSFX: this.laserSFX};
				ig.game.spawnEntity (SimpleLaser, this.pos.x + (this.size.x/2), this.pos.y + (this.size.y/2), settings);
			}
			
		},

        findDestination: function () {
			var goodEnd = false;
			while(!goodEnd){
				this.destY = this.game.player.pos.y + Math.random() * this.circleRange * 2 - this.circleRange;
				this.destX = this.game.player.pos.x + Math.random() * this.circleRange * 2 - this.circleRange;
				if(!collisionCheck(this.destX, this.destY, this, this.game.entities)){
					goodEnd = true;
					this.newpath = false;
				}
			}
			this.redefinePath();
		}
    });
});

