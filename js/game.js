mt = new MersenneTwister(5853192986);

var noiseLevel = function(zoom) {
    var zoom = zoom || 1;
    var ox = mt.nextInt();
    var oy = mt.nextInt();
    return function(x, y) {
        return PerlinNoise.noise((x+ox)/zoom, (y+oy)/zoom, .5);
    }
}

var main = function() {
    var height = 80;
    var width = 150;
    var tilesize = 8;
    var canvas = document.getElementById("canvas");
    canvas.width = width * tilesize;
    canvas.height = height * tilesize;
    var context = canvas.getContext("2d");

    var low = noiseLevel(25);
    var mid = noiseLevel(5);
    var high = noiseLevel(3);

    for (var x=0; x < width; x++) {
        for (var y=0; y < height; y++) {
            var n = low(x,y) + high(x,y) * .1;
            var n2 = mid(x,y);
            var n3 = high(x,y);
            if (n < .6) { // ocean
                style = 'blue';
                if (n2 > .6) { style = '#6495ED'; }
            } else if (n < .7) { // sand
                style = '#FEF0C9';
                //if (n2 > .75) { style = '#D2691E'; }
            } else { // grass
                style = '#32CD32';
                if (n3 > .7) { style = 'gray'; }
            }
            //var style = "rgb(" + n + "," + n + "," + n + ")";
            context.fillStyle = style;
            context.fillRect(x*tilesize, y*tilesize, tilesize, tilesize);
        } 
    }
}
main();
