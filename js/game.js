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
    var cs = 32;
    var low = noiseLevel(25);
    var mid = noiseLevel(5);
    var high = noiseLevel(3);
    var chunkspan = bs * cs;
    var chunks = {};
    var materials = {};
    geometry = new THREE.PlaneGeometry( bs, bs );
    //geometry = new THREE.CubeGeometry( bs, bs, bs );
    var materialCache = {};

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );

        // STATS
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 100;
        document.body.appendChild( stats.domElement );
    }

    function renderChunk(cx, cy) {
        console.log('rendering chunk ' + cx + ',' + cy);
        //var merged = new THREE.Geometry();
        //var materials = [];
        for (var x=0; x < cs; x++) {

            for (var y=0; y < cs; y++) {
                var z = 0;
                var px = cx * chunkspan + x * bs
                var py = cy * chunkspan + y * bs
                var n = low(px/bs,py/bs) + high(px/bs,py/bs) * .1;
                var n2 = mid(px/bs,py/bs);
                var n3 = high(px/bs,py/bs);
                if (n < .6) { // ocean
                    style = 0x00000ff;
                    if (n2 > .6) { style = 0x6495ED; }
                } else if (n < .7) { // sand
                    style = 0xfef0c9;
                    if (n3 > .85) { style = 0x808080; }
                    z = bs;
                } else { // grass
                    style = 0x32cd32;
                    if (n2 > .7) { style = 0x458B00; }
                    z = 2 * bs;
                }
                if (!materialCache[style]) {
                    materialCache[style] = new THREE.MeshBasicMaterial( { color: style } );
                }
                material = materialCache[style];
                //materials.push(material);
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(px, py, 0);
                //THREE.GeometryUtils.merge( merged, mesh );
                scene.add(mesh);
            }
        }
        /*var mesh = new THREE.Mesh( merged, new THREE.MeshFaceMaterial( materials ) );
        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals();
        scene.add( mesh );*/
    }

    function generateNewChunks() {
        var distance = 3000;
        for (var x = camera.position.x - distance; x < camera.position.x + distance; x += chunkspan) {
            for (var y = camera.position.y - distance; y < camera.position.y + distance; y += chunkspan) {
                var cx = Math.floor(x/chunkspan);
                var cy = Math.floor(y/chunkspan);
                var key = ""+cx+","+cy;
                if (!chunks[key]) {
                    renderChunk(cx, cy);
                    chunks[key] = true;
                }
            }
        }
    }

    function render() {
        renderer.render( scene, camera );
    }

    function update() {
        var delta = clock.getDelta(); // seconds.
        var moveDistance = 1000 * delta; // 200 pixels per second
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

        generateNewChunks();
        stats.update();
    }

    function animate() {
        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );
        render();
        update();
    }
}

//main();
main_gl();
