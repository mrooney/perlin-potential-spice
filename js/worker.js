importScripts("mt.js", "perlin.js", "const.js");

onmessage = function(e) {
    var start = new Date().getTime();
    var chunkSize = constants.chunksize;
    var tileSize = constants.tilesize;
    var cx = e.data.cx;
    var cy = e.data.cy;
    var imgData = e.data.imgData;

    var data = imgData.data;
    var chunkstyles = new Array(chunkSize*chunkSize);
    var x, y, offset, rgb;

    for (x=0; x < chunkSize; x++) {
        for (y=0; y < chunkSize; y++) {
            chunkstyles[y*chunkSize+x] = constants.get_block_style(cx, cy, x, y);
        }
    }

    for (y=0; y < constants.chunkspan; y++) {
        for (x=0; x < constants.chunkspan; x++) {
            offset = (y * constants.chunkspan + x) * 4;
            rgb = chunkstyles[Math.floor(y/tileSize) * chunkSize + Math.floor(x/tileSize)];
            data[offset] = rgb[0];
            data[offset + 1] = rgb[1];
            data[offset + 2] = rgb[2];
            data[offset + 3] = 255;
        }
    }

    console.log("Generated chunk in " + (new Date().getTime() - start));
    postMessage({cx: cx, cy: cy, imgData: imgData});
}
