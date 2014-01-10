mt = new MersenneTwister(5853192983);

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
                if (n3 > .85) { style = 'gray'; }
            } else { // grass
                style = '#32CD32';
                if (n2 > .7) { style = '#458B00'; }
            }
            //var style = "rgb(" + n + "," + n + "," + n + ")";
            context.fillStyle = style;
            context.fillRect(x*tilesize, y*tilesize, tilesize, tilesize);
        } 
    }
}

var main_gl = function() {
    var camera, scene, renderer;
    var geometry, material, mesh;
    var keyboard = new THREEx.KeyboardState();
    var clock = new THREE.Clock();

    var bs = 32;
    var low = noiseLevel(25);
    var mid = noiseLevel(5);
    var high = noiseLevel(3);

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();

        geometry = new THREE.CubeGeometry( bs, bs, bs );

        for (var x=0; x < 64; x++) {
            for (var y=0; y < 64; y++) {
                var n = low(x,y) + high(x,y) * .1;
                var n2 = mid(x,y);
                var n3 = high(x,y);
                if (n < .6) { // ocean
                    style = 0x00000ff;
                    if (n2 > .6) { style = 0x6495ED; }
                } else if (n < .7) { // sand
                    style = 0xfef0c9;
                    if (n3 > .85) { style = 0x808080; }
                } else { // grass
                    style = 0x32cd32;
                    if (n2 > .7) { style = 0x458B00; }
                }
                material = new THREE.MeshBasicMaterial( { color: style, wireframe: false } );
                mesh = new THREE.Mesh( geometry, material );
                mesh.position.set(x*bs, y*bs, 0);
                scene.add( mesh );
            }
        }

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );

    }

    function update() {
        var delta = clock.getDelta(); // seconds.
        var moveDistance = 100 * delta; // 200 pixels per second
        var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

        if ( keyboard.pressed("W") ) {
            camera.position.y += moveDistance;
        }
        if ( keyboard.pressed("S") ) {
            camera.position.y -= moveDistance;
        }
        if ( keyboard.pressed("A") ) {
            camera.position.x -= moveDistance;
        }
        if ( keyboard.pressed("D") ) {
            camera.position.x += moveDistance;
        }
    }

    function animate() {
        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );
        update();
        renderer.render( scene, camera );
    }
}

//main();
main_gl();
