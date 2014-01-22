importScripts("mt.js", "perlin.js", "const.js");

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

onmessage = function(e) {
    var chunkSize = e.data.chunkSize;
    var tileSize = e.data.tileSize;
    var cx = e.data.cx;
    var cy = e.data.cy;
    var imgData = e.data.imgData;

    var chunkSpan = chunkSize * tileSize;
    var chunkStyles = new Array(chunkSize*chunkSize);
    var x, y, height, style, rx, ry, n, n2, n3, rgb, offset, cindex;

    var start = new Date().getTime();

    for (x=0; x < chunkSize; x++) {
        for (y=0; y < chunkSize; y++) {
            rx = cx * chunkSize + x;
            ry = cy * chunkSize + y;
            n = low(rx,ry) + high(rx,ry) * .1;
            n2 = mid(rx,ry);
            n3 = high(rx,ry);
            style = [255, 0, 0];

            if (n < thresh[2]) {
                height = 0;
            } else if (n < thresh[3]) {
                height = 1;
            } else if (n < thresh[4]) {
                height = 2;
            } else {
                height = 3;
            }

            if (n2 < thresh[3]) {
                style = constants.styles[height];
            } else {
                style = constants.variants[height];
            }

            chunkStyles[y*chunkSize+x] = style;
        }
    }


    var data = imgData.data;
    for (y = 0; y < chunkSpan; y++) {
        for (x = 0; x < chunkSpan; x++) {
            offset = (y * chunkSpan + x) * 4;
            rgb = chunkStyles[Math.floor(y/tileSize) * chunkSize + Math.floor(x/tileSize)];
            data[offset] = rgb[0];
            data[offset + 1] = rgb[1];
            data[offset + 2] = rgb[2];
            data[offset + 3] = 255;
        }
    }

    //console.log("Generated chunk in " + (new Date().getTime() - start));
    postMessage({cx: cx, cy: cy, imgData: imgData});
}
