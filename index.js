var createGame = require('voxel-engine');

var game = createGame({
    texturePath: 'textures/',
});
var container = document.body;
game.appendTo(container);

var createPlayer = require("voxel-player")(game);

var player = createPlayer('shama.png');
player.possess();
player.yaw.position.set(0, 100, 0);

/*var snow = require('voxel-snow')({
  // pass it a copy of the game
  game: game,
  // how many particles of snow
  count: 1000,
  // size of snowfall
  size: 20,
  // speed it falls
  speed: 0.1,
  // speed it drifts
  drift: 1,
  // material of the particle
  material: new game.THREE.ParticleBasicMaterial({color: 0xffffff, size: 1})
});

game.on('tick', function() {
  // update the snow by calling tick
  snow.tick();
});*/
