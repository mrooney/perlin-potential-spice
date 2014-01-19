var mod = function(m, n) { return ((m%n)+n)%n; }
var clamp = function(x, min, max) { return Math.max(min, Math.min(x, max)); }

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

    var last = null;
    // The higher this value, the less the fps will reflect temporary variations
    // A value of 1 will only keep the last value
    var filterStrength = 10;
    var frameTime = 0, lastLoop = new Date, thisLoop;

    var state = {
        x: 0,
        y: 0,
        pressed: {},
        mouse: {x: canvas.width/2, y: canvas.height/2},
        gamepad: {timestamp: 0, previous_buttons: []},
        wrkr: null,
    }

    var renderChunk = function(cx, cy) {
        var message = {
            chunkSize: chunksize,
            tileSize: tilesize,
            cx: cx,
            cy: cy,
            imgData: bctx.getImageData(0, 0, chunkspan, chunkspan),
        }
        state.wrkr.postMessage(message);
    }

    var getVisibleChunks = function(offset) {
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

    var renderChunks = function() {
        var visible = getVisibleChunks();
        var nearby = getVisibleChunks(1);
        // Generate any nearby chunks.
        $.each(nearby, function(i, chunk_key) {
            if (chunk_queue[chunk_key] === undefined) {
                //console.log("generating ", chunk_key);
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

    var logIfDifferent = function(log) {
        if (state.lastLog != log) {
            console.log(log);
            state.lastLog = log;
        }
    }

    var renderMouseover = function() {
        var mx = state.mouse.x;
        var my = state.mouse.y;
        ctx.fillStyle = "pink";
        ctx.strokeRect(mx - (state.x + mx) % tilesize + state.x, my - (state.y + my) % tilesize + state.y, tilesize, tilesize);
    }

    var Block = function(cx, cy, bx, by) {
        var self = this;
        var rx = bx * tilesize;
        var ry = by * tilesize;

        this.color = function(r, g, b) {
            var chunk = chunk_cache[[cx, cy]];
            for (var x=rx; x<rx+tilesize; x++) {
                for (var y=ry; y<ry+tilesize; y++) {
                    var offset = (y * chunksize * tilesize + x) * 4;
                    chunk.data[offset] = r;
                    chunk.data[offset+1] = g;
                    chunk.data[offset+2] = b;
                }
            }
            return self;
        }

        this.neighbors = function() {
            var nabes = [];
            $.each([[-1,0],[1,0],[0,-1],[0,1]], function(i, os) {
                var ox = os[0];
                var oy = os[1];
                var nbx = bx + ox;
                var nby = by + oy;
                var ncx = cx;
                var ncy = cy;
                if (nbx < 0) { ncx -= 1; }
                if (nbx >= chunksize) { ncx += 1; }
                if (nby < 0) { ncy -= 1; }
                if (nby >= chunksize) { ncy += 1; }
                nbx = mod(nbx, chunksize);
                nby = mod(nby, chunksize);
                nabes.push(new Block(ncx, ncy, nbx, nby));
            })
            return nabes;
        }

        this.noise = function() {
            var rx = cx * chunksize + bx;
            var ry = cy * chunksize + by;
            var l = constants.low(rx,ry) + constants.high(rx,ry) * .1;
            var m = constants.mid(rx,ry);
            var h = constants.high(rx,ry);
            return [l, m, h];
        }

        this.height = function(delta, decline) {
            var chunk = chunk_cache[[cx, cy]];
            if (delta === undefined) {
                var offset = (ry * chunksize * tilesize + rx) * 4;
                var r = chunk.data[offset];
                var g = chunk.data[offset+1];
                var b = chunk.data[offset+2];
                var height = constants.heights[[r,g,b]];
                if (height === undefined) { console.log("NULLHEIGHT " + [r,g,b].join()); }
                return height;
            } else {
                var current = self.height();
                var newheight = clamp(current + delta, 0, constants.styles.length-1);
                var newstyle;
                //if (newheight != current) {
                    if (self.noise()[2] > 0.7 && constants.variants[newheight]) {
                        newstyle = constants.variants[newheight];
                    } else {
                        newstyle = constants.styles[newheight];
                    }
                    if (!newstyle) { console.log(current); }
                    self.color.apply(null, newstyle);
                    $.each(self.neighbors(), function(i, nabe) {
                        var nabeheight = nabe.height();
                        if (!decline) {
                            nabe.height(newheight - nabeheight, true);
                        } else {
                            var nabediff = newheight - nabeheight;
                            if (Math.abs(nabediff) > 1) {
                                var delta = nabediff > 0 ? nabediff - 1 : nabediff + 1;
                                nabe.height(delta, true);
                            }
                        }
                    });
                //}
            }
            return self;
        }

        this.str = function() {
            return [cx, cy, bx, by].join();
        }

        return this;
    }
    var getHoverBlock = function() {
        var ax = state.x + state.mouse.x;
        var ay = state.y + state.mouse.y;
        var cx = Math.floor(ax / chunkspan);
        var cy = Math.floor(ay / chunkspan);
        var bx = Math.floor((Math.abs(ax) % chunkspan)/tilesize);
        var by = Math.floor((Math.abs(ay) % chunkspan)/tilesize);
        if (cx < 0) { bx = chunksize - bx; }
        if (cy < 0) { by = chunksize - by; }
        return new Block(cx, cy, bx, by);
    }

    var raiseHoverBlock = function() {
        getHoverBlock().height(1);
    }

    var lowerHoverBlock = function() {
        getHoverBlock().height(-1);
    }

    var init = function() {
        state.wrkr = new Worker('js/worker.js');
        state.wrkr.onmessage = function(e) {
            var key = ""+e.data.cx+","+e.data.cy;
            chunk_cache[key] = e.data.imgData;
        }

        document.onkeydown = function(e) {
            var key = String.fromCharCode(e.keyCode);
            state.pressed[key] = true;
        }

        document.onkeyup = function(e) {
            var keyCode = ('which' in e) ? e.which : e.keyCode;
            var key = String.fromCharCode(keyCode);
            state.pressed[key] = false;
        }

        canvas.addEventListener('mousemove', function(evt) {
            var rect = canvas.getBoundingClientRect();
            state.mouse = {
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top,
            };
        }, false);

        $(canvas).on("click", function(e) {
            if (e.shiftKey) {
                lowerHoverBlock();
            } else {
                raiseHoverBlock();
            }
        });

        var fpsOut = document.getElementById('fps');
        setInterval(function(){
          fpsOut.innerHTML = (1000/frameTime).toFixed(1) + " fps";
        },1000);
    }

    var padmap = {
        // Assume remapping: https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#remapping.
        rb_down: function(gamepad) {
            return gamepad.buttons[5];
        },
        raise_down: function(gamepad) {
            return gamepad.buttons[2];
        },
        lower_down: function(gamepad) {
            return gamepad.buttons[1];
        },
    }

    var update = function(delta) {
        var scrollmult = 3;

        var gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];
        if (gamepad && gamepad.timestamp > state.gamepad.timestamp) {
            // If we are using the gamepad, place the cursor in the middle.
            state.mouse.x = canvas.width/2;
            state.mouse.y = canvas.height/2;

            state.gamepad.ax = Math.round(gamepad.axes[0]);
            state.gamepad.ay = Math.round(gamepad.axes[1]);
            state.gamepad.rb = padmap.rb_down(gamepad);
            state.gamepad.raising = padmap.raise_down(gamepad);
            state.gamepad.lowering = padmap.lower_down(gamepad);

            state.gamepad.timestamp = gamepad.timestamp;
            state.gamepad.previous_buttons = gamepad.buttons.slice(0);
        }
        if (state.gamepad.rb) { scrollmult *= 2; }
        if (state.gamepad.raising) { raiseHoverBlock(); }
        if (state.gamepad.lowering) { lowerHoverBlock(); }

        state.x += (state.gamepad.ax || 0) * scrollmult;
        state.y += (state.gamepad.ay || 0) * scrollmult;

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

    var render = function(delta) {
        renderChunks();
        renderMouseover();
    }

    var animate = function(timestamp) {
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
