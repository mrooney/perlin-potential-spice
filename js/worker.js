function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

importScripts("mt.js", "perlin.js");

mt = new MersenneTwister(5853192986);

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

onmessage = function(e) {
    var chunkSize = e.data.chunkSize;
    var tileSize = e.data.tileSize;
    var cx = e.data.cx;
    var cy = e.data.cy;
    var imgData = e.data.imgData;

    var chunkSpan = chunkSize * tileSize;
    console.log("data: " + chunkSize + " " + tileSize + " " + chunkSpan);

    var chunkStyles = {};

    var x, y, style, rx, ry, n, n2, n3, rgb, offset, cindex;

    for (x=0; x < chunkSize; x++) {
        for (y=0; y < chunkSize; y++) {
            rx = cx * chunkSize + x;
            ry = cy * chunkSize + y;
            n = low(rx,ry) + high(rx,ry) * .1;
            n2 = mid(rx,ry);
            n3 = high(rx,ry);
            style = "#ff0000";
            if (n < .6) { // ocean
                style = "#0000ff";
                if (n2 > .6) { style = "#6495ed"; }
            } else if (n < .7) { // sand
                style = "#fef0c9";
                //if (n2 > .75) { style = '#D2691E'; }
            } else { // grass
                style = "#32cd32";
                if (n3 > .7) { style = "#999999"; }
            }
            chunkStyles[[x, y]] = style;
        }
    }

    for (y = 0; y < chunkSpan; y++) {
        for (x = 0; x < chunkSpan; x++) {
            offset = (y * chunkSpan + x) * 4;
            cindex = [Math.floor(x/tileSize), Math.floor(y/tileSize)];
            style = chunkStyles[cindex];
            rgb = hexToRgb(style);
            imgData.data[offset] = rgb.r;
            imgData.data[offset + 1] = rgb.g;
            imgData.data[offset + 2] = rgb.b;
            imgData.data[offset + 3] = 255;
        }
    }

    postMessage({cx: cx, cy: cy, imgData: imgData});
}
