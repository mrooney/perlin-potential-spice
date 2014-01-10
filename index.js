var createGame = require('voxel-engine');

var game = createGame({
    texturePath: 'textures/',
});
var container = document.body;
game.appendTo(container);

var createPlayer = require("voxel-player")(game);

var player = createPlayer('shama.png');
player.possess();
player.yaw.position.set(0, 5, 0);

//var terrain = require('voxel-perlin-terrain');
//var chunkSize = 32
// initialize your noise with a seed, floor height, ceiling height and scale factor
// var generateChunk = terrain('foo', 0, 5, 20)
// then hook it up to your game as such:
/*game.voxels.on('missingChunk', function(p) {
    console.log(p);
    var low = p;
    var high = [p[0]+chunkSize, p[1]+chunkSize, p[2]+chunkSize];
    var chunk = require('voxel').generate(low, high, function(x,y,z) {
        return Math.round(Math.random() * 0xffffff);
    });
    chunk.position = p;
    var voxels = generateChunk(p, chunkSize)
    var chunk = {
        position: p,
        dims: [chunkSize, chunkSize, chunkSize],
        voxels: voxels
    }
    console.log(chunk)
    game.showChunk(chunk)
});*/
/*require('voxel').generate([0,0,0], [16,16,16], function(x,y,z) {
  return Math.round(Math.random() * 0xffffff)
})*/

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
