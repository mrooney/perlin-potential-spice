importScripts("mt.js", "perlin.js", "const.js");

onmessage = function(e) {
    var chunkSize = constants.chunksize;
    var tileSize = constants.tilesize;
    var cx = e.data.cx;
    var cy = e.data.cy;
    var imgData = e.data.imgData;

    var chunkStyles = new Array(chunkSize*chunkSize);
    var x, y, style;

    var start = new Date().getTime();

    for (x=0; x < chunkSize; x++) {
        for (y=0; y < chunkSize; y++) {
            chunkStyles[y*chunkSize+x] = constants.get_block_style(cx, cy, x, y);
        }
    }


    var data = imgData.data;
    for (y = 0; y < constants.chunkspan; y++) {
        for (x = 0; x < constants.chunkspan; x++) {
            offset = (y * constants.chunkspan + x) * 4;
            rgb = chunkStyles[Math.floor(y/tileSize) * chunkSize + Math.floor(x/tileSize)];
            data[offset] = rgb[0];
            data[offset + 1] = rgb[1];
            data[offset + 2] = rgb[2];
            data[offset + 3] = 255;
        }
    }

    console.log("Generated chunk in " + (new Date().getTime() - start));
    postMessage({cx: cx, cy: cy, imgData: imgData});
}
