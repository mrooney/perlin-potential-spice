importScripts("mt.js", "perlin.js", "const.js");

onmessage = function(e) {
    var chunkSize = e.data.chunkSize;
    var tileSize = e.data.tileSize;
    var cx = e.data.cx;
    var cy = e.data.cy;
    var imgData = e.data.imgData;

    var chunkSpan = chunkSize * tileSize;
    var chunkStyles = new Array(chunkSize*chunkSize);
    var x, y, style, rx, ry, n, n2, n3, rgb, offset, cindex;
    var start = new Date().getTime();

    for (x=0; x < chunkSize; x++) {
        for (y=0; y < chunkSize; y++) {
            rx = cx * chunkSize + x;
            ry = cy * chunkSize + y;
            n = constants.low(rx,ry) + constants.high(rx,ry) * .1;
            n2 = constants.mid(rx,ry);
            n3 = constants.high(rx,ry);
            style = [255, 0, 0];
            if (n < .6) { // ocean
                style = constants.styles[0];
                if (n2 > .6) { style = constants.styles[1]; }
            } else if (n < .7) { // sand
                style = constants.styles[2];
            } else { // grass
                style = constants.styles[3];
                if (n3 > .7) { style = constants.variants[3]; }
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
