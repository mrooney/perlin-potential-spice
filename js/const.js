constants = {};
constants.tilesize = 8;
constants.chunksize = 75;
constants.chunkspan = constants.tilesize * constants.chunksize;

constants.styles = [
    [0, 0, 255], // ocean
    [254, 240, 201], // sand
    [50, 205, 50], // grass
    [153, 153, 153], // mountain
]
constants.variants = [
    [100, 149, 237], // ocean
    [229, 216, 181], // sand
    [30, 123, 30], // grass
    [183, 153, 153], // mountain
]
constants.heights = {};
for (var i=0; i<constants.styles.length; i++) {
    constants.heights[constants.styles[i]] = i;
    constants.heights[constants.variants[i]] = i;
};

mt = new MersenneTwister();

var noiseLevel = function(zoom) {
    var zoom = zoom || 1;
    var ox = mt.nextInt();
    var oy = mt.nextInt();
    return function(x, y) {
        return PerlinNoise.noise((x+ox)/zoom, (y+oy)/zoom, .5);
    }
}

var low = noiseLevel(25);
var mid = noiseLevel(5);
var high = noiseLevel(3);

var thresh = [mt.next(), mt.next(), mt.next(), mt.next(), mt.next(), mt.next()];
thresh.sort(function (a, b) { return a-b; });

constants.get_block_variant = function(cx, cy, bx, by) {
    var rx = cx * constants.chunksize + bx;
    var ry = cy * constants.chunksize + by;
    var n2 = mid(rx,ry);
    if (n2 < thresh[3]) {
        return constants.styles;
    } else {
        return constants.variants;
    }
}

constants.get_block_style = function(cx, cy, bx, by) {
    var rx = cx * constants.chunksize + bx;
    var ry = cy * constants.chunksize + by;
    var n = low(rx,ry) + high(rx,ry) * .1;
    var height;

    if (n < thresh[2]) {
        height = 0;
    } else if (n < thresh[3]) {
        height = 1;
    } else if (n < thresh[4]) {
        height = 2;
    } else {
        height = 3;
    }
    return constants.get_block_variant(cx, cy, bx, by)[height];
}

