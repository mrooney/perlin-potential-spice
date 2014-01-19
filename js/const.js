constants = {};
constants.styles = [
    [0, 0, 255],
    [100, 149, 237],
    [254, 240, 201],
    [50, 205, 50],
]
constants.variants = [
    null,
    null,
    null,
    [153, 153, 153],
]
constants.heights = {};
for (var i=0; i<constants.styles.length; i++) {
    constants.heights[constants.styles[i]] = i;
    constants.heights[constants.variants[i]] = i;
};


constants.mt = new MersenneTwister();

constants.noiseLevel = function(zoom) {
    var zoom = zoom || 1;
    var ox = constants.mt.nextInt();
    var oy = constants.mt.nextInt();
    return function(x, y) {
        return PerlinNoise.noise((x+ox)/zoom, (y+oy)/zoom, .5);
    }
}

constants.low = constants.noiseLevel(25);
constants.mid = constants.noiseLevel(5);
constants.high = constants.noiseLevel(3);

