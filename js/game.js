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
    var ctx = canvas.getContext("2d");

    var chunkspan = tilesize * 75;
    var xchunks = Math.ceil(canvas.width / chunkspan);
    var ychunks = Math.ceil(canvas.height / chunkspan);
    var chunk_cache = {};

    var buffer = document.createElement("canvas");
    buffer.width = width * tilesize;
    buffer.height = height * tilesize;
    var bctx = buffer.getContext("2d");

    var low = noiseLevel(25);
    var mid = noiseLevel(5);
    var high = noiseLevel(3);

    var state = {
        x: 0,
        y: 0,
        pressed: {},
    }

    function init() {
        document.onkeydown = function(e) {
            var key = String.fromCharCode(e.keyCode);
            state.pressed[key] = true;
        }

        document.onkeyup = function(e)
        {
            var keyCode = ('which' in e) ? e.which : e.keyCode;
            var key = String.fromCharCode(keyCode);
            state.pressed[key] = false;
        }
    }

    var imgdata;
    function render(delta) {
        renderChunks();
    }

    function renderChunk(cx, cy) {
        for (var x=0; x < width; x++) {
            for (var y=0; y < height; y++) {
                var rx = cx * chunkspan / tilesize + x;
                var ry = cy * chunkspan / tilesize + y;
                var n = low(rx,ry) + high(rx,ry) * .1;
                var n2 = mid(rx,ry);
                var n3 = high(rx,ry);
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
                bctx.fillStyle = style;
                bctx.fillRect(x*tilesize, y*tilesize, tilesize, tilesize);
            }
        }
        return bctx.getImageData(0, 0, width*tilesize, height*tilesize);
    }
    
    function getVisibleChunks() {
        var topleftcx = Math.floor(state.x / chunkspan);
        var topleftcy = Math.floor(state.y / chunkspan);
        var visible = [];
        for (var x=0; x < xchunks; x++) {
            for (var y=0; y < xchunks; y++) {
                visible.push(""+(topleftcx+x)+","+(topleftcy+y));
            }
        }
        return visible;
    }

    function renderChunks() {
        var visible = getVisibleChunks();
        var indices;
        $.each(visible, function(i, chunk_key) {
            // If the chunk isn't cached, generate it.
            indices = $.map(chunk_key.split(","), function(x) { return parseInt(x); })
            if (chunk_cache[chunk_key] === undefined) {
                console.log("hit ", chunk_key);
                chunk_cache[chunk_key] = renderChunk.apply(null, indices);
            }
            chunkdata = chunk_cache[chunk_key];
            bctx.putImageData(chunkdata, 0, 0);
            ctx.drawImage(buffer, indices[0]*chunkspan, indices[1]*chunkspan);
        });
    }

    function update(delta) {
        var scrollmult = 3;
        if (state.pressed["W"] === true) {
            state.y -= scrollmult;
        }
        if (state.pressed["S"] === true) {
            state.y += scrollmult;
        }
        if (state.pressed["A"] === true) {
            state.x -= scrollmult;
        }
        if (state.pressed["D"] === true) {
            state.x += scrollmult;
        }
        ctx.translate(-state.x, -state.y);
    }

    var last = null;
    function animate(timestamp) {
        var delta = 0;
        if (last !== null) {
            delta = timestamp - last;
        }
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        update(delta);
        render(delta);
        ctx.restore();
        last = timestamp;
    }

    init();
    requestAnimationFrame(animate);
}
main();
