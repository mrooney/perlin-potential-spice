var main = function() {
    var height = 80;
    var width = 150;
    var tilesize = 8;
    var canvas = document.getElementById("canvas");
    canvas.width = width * tilesize;
    canvas.height = height * tilesize;
    var ctx = canvas.getContext("2d");

    var chunksize = 75;
    var chunkspan = tilesize * chunksize;
    var xchunks = Math.ceil(canvas.width / chunkspan);
    var ychunks = Math.ceil(canvas.height / chunkspan);
    var chunk_queue = {};
    var chunk_cache = {};

    var buffer = document.createElement("canvas");
    buffer.width = width * tilesize;
    buffer.height = height * tilesize;
    var bctx = buffer.getContext("2d");

    var state = {
        x: 0,
        y: 0,
        pressed: {},
    }

    var wrkr = new Worker('js/worker.js');

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

        var fpsOut = document.getElementById('fps');
        setInterval(function(){
          fpsOut.innerHTML = (1000/frameTime).toFixed(1) + " fps";
        },1000);
    }

    var imgdata;
    function render(delta) {
        renderChunks();
    }

    function renderChunk(cx, cy) {
        var message = {
            chunkSize: chunksize,
            tileSize: tilesize,
            cx: cx,
            cy: cy,
            imgData: bctx.getImageData(0, 0, chunkspan, chunkspan),
        }
        wrkr.postMessage(message);
    }

    wrkr.onmessage = function(e) {
        var key = ""+e.data.cx+","+e.data.cy;
        chunk_cache[key] = e.data.imgData;
    }

    function getVisibleChunks(offset) {
        offset = offset || 0;
        var topleftcx = Math.floor(state.x / chunkspan) - offset;
        var topleftcy = Math.floor(state.y / chunkspan) - offset;
        var visible = [];
        for (var x=0; x < (xchunks+1+offset*2); x++) {
            for (var y=0; y < (xchunks+1+offset*2); y++) {
                visible.push([topleftcx+x, topleftcy+y]);
            }
        }
        return visible;
    }

    function renderChunks() {
        var visible = getVisibleChunks();
        var nearby = getVisibleChunks(1);
        // Generate any nearby chunks.
        $.each(nearby, function(i, chunk_key) {
            if (chunk_queue[chunk_key] === undefined) {
                console.log("generating ", chunk_key);
                chunk_queue[chunk_key] = true;
                renderChunk(chunk_key[0], chunk_key[1]);
            }
        });
        $.each(visible, function(i, chunk_key) {
            chunkdata = chunk_cache[chunk_key];
            if (chunkdata) {
                // TODO: drawImage can take an Image element, so we can cache that instead and skip the expensive bctx.putImageData here.
                // http://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf/
                bctx.putImageData(chunkdata, 0, 0);
                ctx.drawImage(buffer, chunk_key[0]*chunkspan, chunk_key[1]*chunkspan);
            }
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
    // The higher this value, the less the fps will reflect temporary variations
    // A value of 1 will only keep the last value
    var filterStrength = 10;
    var frameTime = 0, lastLoop = new Date, thisLoop;

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
        var thisFrameTime = (thisLoop=new Date) - lastLoop;
        frameTime+= (thisFrameTime - frameTime) / filterStrength;
        lastLoop = thisLoop;
    }

    init();
    requestAnimationFrame(animate);
}
main();
