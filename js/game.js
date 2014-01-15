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

    var buffer = document.createElement("canvas");
    buffer.width = width * tilesize;
    buffer.height = height * tilesize;

    var low = noiseLevel(25);
    var mid = noiseLevel(5);
    var high = noiseLevel(3);

    var state = {
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
    renderChunk();
    function render(delta) {
        ctx.drawImage(buffer, 0, 0);
    }

    function renderChunk(cx, cy) {
        var ctx = buffer.getContext("2d");
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
                ctx.fillStyle = style;
                ctx.fillRect(x*tilesize, y*tilesize, tilesize, tilesize);
            }
        }
        imgdata = ctx.getImageData(0, 0, width*tilesize, height*tilesize);
    }
    
    function update(delta) {
        if (state.pressed["W"] === true) {
            ctx.translate(0, 1);
        }
        if (state.pressed["S"] === true) {
            ctx.translate(0, -1);
        }
        if (state.pressed["A"] === true) {
            ctx.translate(1, 0);
        }
        if (state.pressed["D"] === true) {
            ctx.translate(-1, 0);
        }
    }

    var last = null;
    function animate(timestamp) {
        var delta = 0;
        if (last !== null) {
            delta = timestamp - last;
        }
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update(delta);
        render(delta);
        last = timestamp;
    }

    init();
    requestAnimationFrame(animate);
}
main();
