//global variables
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_size;

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl" , {preserveDrawingBuffer: true});
    //gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (! u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    u_GLobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (! u_GLobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

//constants


let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_finalAngle = 0;
let g_yellowAnimation = false;
let g_eyeYdim = 1;
function addActionsForAllHtmlUI(){

    document.getElementById('animationYellowOn').onclick = function() {g_yellowAnimation = true;};
    document.getElementById('animationYellowOff').onclick = function() {g_yellowAnimation = false;};

    document.getElementById('angleSlider').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById('yellowSlider').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});
    document.getElementById('magentaSlider').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});
    document.getElementById('finalSlider').addEventListener('mousemove', function() {g_finalAngle = this.value; renderAllShapes();});
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForAllHtmlUI();
    //Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev) {
        // Check if the left mouse button is clicked and the shift key is pressed
        if (ev.button === 0 && ev.shiftKey) {
            clicked(ev);
        }
        else if (ev.button === 0) {
        dragged(ev);
    }
    };
    
    
    canvas.onmousemove = function(ev) {
        // Check if the left mouse button is clicked, the shift key is pressed,
        // and no other buttons are pressed
        if (ev.buttons === 1 && ev.shiftKey && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
            clicked(ev);
        }

        else if (ev.buttons === 1) {
            dragged(ev);
            dragged(ev)
        }
    };

    /*
    canvas.onmousedown = function(ev) {
        // Check if the left mouse button is clicked and the shift key is pressed
        if (ev.button === 0 && ev.shiftKey) {
            clicked(ev);
        }
        else if (ev.button === 0) {
            // Set up event listener for mousemove only when mouse is pressed down
            canvas.onmousemove = function(ev) {
                // Call dragged function
                dragged(ev);
            };
        }
    };
    
    canvas.onmouseup = function(ev) {
        // Remove the mousemove event listener when mouse button is released
        canvas.onmousemove = null;
    };
    
    // Prevent default browser behavior for mousemove event
    canvas.onmousemove = function(ev) {
        ev.preventDefault();
    };
    */

    // Specify the color for clearing <canvas>
    gl.clearColor(0.45, 0.65, 0.98, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime; 

function sendTexttoHTML(text, HtmlID){
    var elm = document.getElementById(HtmlID);
    if (!elm){
        console.log("failed to get id for html");
    }
    elm.innerHTML = text;
}

function tick(){
    var begintimer = performance.now();
    g_seconds = performance.now()/1000 - g_startTime;
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
    var elapsed = performance.now() - begintimer
    sendTexttoHTML( "ms: " + Math.floor(elapsed)+ "fps: " + Math.floor(10000 / elapsed) / 10, "output")
}

let currentEyeSize = 1.0;
let animationInProgress = false;
let isEyeShrunk = false; // Track whether the eye is currently shrunk

// Animation loop function
function animateEye() {
    // Adjust the target eye size based on the current state
    let targetEyeSize;
    if (isEyeShrunk) {
        targetEyeSize = 0.15;
    } else {
        targetEyeSize = 1.0;
    }
    

    if (currentEyeSize < targetEyeSize) {
        currentEyeSize += 0.1; // Adjust the step size as needed
    } else if (currentEyeSize > targetEyeSize) {
        currentEyeSize -= 0.1; // Adjust the step size as needed
    } else {
        // Stop the animation when the target size is reached
        animationInProgress = false;
        return;
    }
    
    // Update the eye size
    g_eyeYdim = currentEyeSize;
    if (currentEyeSize < 0.17){
        isEyeShrunk = false;
    }

    // Request the next frame
    requestAnimationFrame(animateEye);
}



//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];
function convertCordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);

}
function updateAnimationAngles(){
    if (g_yellowAnimation){
        g_yellowAngle = (15 * Math.sin(g_seconds));
    }
}

function renderAllShapes(){
    var globalRotMat=new Matrix4().rotate(g_globalAngle, 0,1,0).rotate(g_globalAngleY, 1,0,0);
    gl.uniformMatrix4fv(u_GLobalRotateMatrix, false, globalRotMat.elements);


    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // arm 1
    var body = new Cube(0.98,0.68, 0.45,1);
    //body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.translate(-.25, -0.75, 0.0);
    //body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.4, 0.4, 0.4);
    body.render();

     // arm 1 ------------------------------------------------------------------------------------
    var leftArm = new Cube(0.98,0.68, 0.45,1);
    //leftArm.color = [1,1,0,1];
    leftArm.matrix.rotate(-90, 0,1,0);
    leftArm.matrix.rotate(90, 1,0,0);

    leftArm.matrix.rotate(-g_yellowAngle,1,0,0);
    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.17, 0.5, 0.17);
    leftArm.matrix.translate(0.2, 0.15, 3.3);
    leftArm.render();

    
    var box = new Cube(0.98,0.68, 0.45,1);
    //box.color = [1,0,1,1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.rotate(-45, 1 ,0,0);
    box.matrix.rotate(-g_magentaAngle, 0,1,0);
    box.matrix.scale(0.14, 0.23, 0.14);
    box.matrix.translate(0.38, -0.65, 5.6);
    box.render();

    
    var top = new Cube(1,1,1,1);
    //top.color = [0,1,1,1];
    top.matrix = yellowCoordinatesMat;
    box.matrix.rotate(-90, 0 ,1,0);
    top.matrix.rotate(-g_finalAngle, 0,0,1);
    top.matrix.scale(0.7, 0.7, 0.7);
    top.matrix.translate(0.3, 1.4, -1.2);
    top.render();

    // arm 2---------------------------------------------------------
    var leftArm2 = new Cube(0.98,0.68, 0.45,1);
    //leftArm2.color = [1,1,0,1];
    leftArm2.matrix.rotate(-90, 0,1,0);
    leftArm2.matrix.rotate(90, 1,0,0);

    leftArm2.matrix.rotate(-g_yellowAngle,1,0,0);
    var yellowCoordinatesMat2 = new Matrix4(leftArm2.matrix);
    leftArm2.matrix.scale(0.17, 0.5, 0.17);
    leftArm2.matrix.translate(1.35, 0.15, 3.3);
    leftArm2.render();

    
    var box2 = new Cube(0.98,0.68, 0.45,1);
    //box2.color = [1,0,1,1];
    box2.matrix = yellowCoordinatesMat2;
    box2.matrix.rotate(-45, 1 ,0,0);
    box2.matrix.rotate(-g_magentaAngle, 0,1,0);
    box2.matrix.scale(0.14, 0.23, 0.14);
    box2.matrix.translate(1.78, -0.65, 5.6);
    box2.render();

    
    var top2 = new Cube(1,1,1,1);
    //top2.color = [0,1,1,1];
    top2.matrix = yellowCoordinatesMat2;
    box2.matrix.rotate(-90, 0 ,1,0);
    top2.matrix.rotate(-g_finalAngle, 0,0,1);
    top2.matrix.scale(0.7, 0.7, 0.7);
    top2.matrix.translate(0.3, 1.4, -1.2);
    top2.render();

    // arm 3 ----------------------------------------------------------------------------------------------
    var leftArm3 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm3.matrix.rotate(-90, 1,0,0);
    leftArm3.matrix.rotate(90, 0,1,0);
    leftArm3.matrix.rotate(g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat3 = new Matrix4(leftArm3.matrix);
    leftArm3.matrix.scale(0.17, 0.5, 0.17);
    leftArm3.matrix.translate(3.3, -0.35, -1.3);
    
    leftArm3.render();

    var box3 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box3.matrix = yellowCoordinatesMat3;
    box3.matrix.rotate(-45, 0 ,0,1);
    box3.matrix.rotate(-g_magentaAngle, 0,1,0);
    box3.matrix.scale(0.14, 0.23, 0.14);
    box3.matrix.translate(0.98, 2.9, -1.5);
    box3.render();

    var top3 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top3.matrix = yellowCoordinatesMat3;
    box3.matrix.rotate(-90, 0 ,0,1);
    top3.matrix.rotate(-g_finalAngle, 0,0,1);
    top3.matrix.scale(0.7, 0.7, 0.7);
    top3.matrix.translate(-2.4, 0.1, 0.16);
    top3.render();


    // arm 4----------------------------------------------------------------------------------------------
    var leftArm4 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm4.matrix.rotate(-90, 1,0,0);
    leftArm4.matrix.rotate(90, 0,1,0);
    leftArm4.matrix.rotate(g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat4 = new Matrix4(leftArm4.matrix);
    leftArm4.matrix.scale(0.17, 0.5, 0.17);
    leftArm4.matrix.translate(3.3, -0.35, -0.20);
    
    leftArm4.render();

    var box4 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box4.matrix = yellowCoordinatesMat4;
    box4.matrix.rotate(-45, 0 ,0,1);
    box4.matrix.rotate(-g_magentaAngle, 0,1,0);
    box4.matrix.scale(0.14, 0.23, 0.14);
    box4.matrix.translate(0.98, 2.9, -0.2);
    box4.render();

    var top4 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top4.matrix = yellowCoordinatesMat4;
    box4.matrix.rotate(-90, 0 ,0,1);
    top4.matrix.rotate(-g_finalAngle, 0,0,1);
    top4.matrix.scale(0.7, 0.7, 0.7);
    top4.matrix.translate(-2.4, 0.4, 0.16);
    top4.render();


    // arm five ----------------------------------------------------------------------------------------------
    var leftArm5 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm5.matrix.rotate(90, 1,0,0);
    leftArm5.matrix.rotate(90, 0,1,0);
    leftArm5.matrix.rotate(-g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat5 = new Matrix4(leftArm5.matrix);
    leftArm5.matrix.scale(0.17, 0.5, 0.17);
    leftArm5.matrix.translate(-4.1, 0.45, -1.4);
    
    
    leftArm5.render();

    var box5 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box5.matrix = yellowCoordinatesMat5;
    box5.matrix.rotate(45, 0 ,0,1);
    box5.matrix.rotate(-g_magentaAngle, 0,1,0);
    box5.matrix.scale(0.14, 0.23, 0.14);
    box5.matrix.translate(0.2, 4.0, -1.6);
    box5.render();

    var top5 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top5.matrix = yellowCoordinatesMat5;
    box5.matrix.rotate(-90, 0 ,0,1);
    top5.matrix.rotate(-g_finalAngle, 0,0,1);
    top5.matrix.scale(0.7, 0.7, 0.7);
    top5.matrix.translate(-2.4, 0.1, 0.16);
    top5.render();



    var leftArm6 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm6.matrix.rotate(90, 1,0,0);
    leftArm6.matrix.rotate(90, 0,1,0);
    leftArm6.matrix.rotate(-g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat6 = new Matrix4(leftArm6.matrix);
    leftArm6.matrix.scale(0.17, 0.5, 0.17);
    leftArm6.matrix.translate(-4.1, 0.45, -0.3);
    leftArm6.render();

    var box6 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box6.matrix = yellowCoordinatesMat6;
    box6.matrix.rotate(45, 0 ,0,1);
    box6.matrix.rotate(-g_magentaAngle, 0,1,0);
    box6.matrix.scale(0.14, 0.23, 0.14);
    box6.matrix.translate(0.2, 4.0, -0.4);
    box6.render();
    
    var top6 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top6.matrix = yellowCoordinatesMat6;
    box6.matrix.rotate(-90, 0 ,0,1);
    top6.matrix.rotate(-g_finalAngle, 0,0,1);
    top6.matrix.scale(0.7, 0.7, 0.7);
    top6.matrix.translate(-2.4, -0.1, 0.16);
    top6.render();

    // arm7----------------------------------------------------------------------------------------------
    var leftArm7 = new Cube(0.98,0.68, 0.45,1);
    //leftArm.color = [1,1,0,1];
    leftArm7.matrix.rotate(-90, 0,1,0);
    leftArm7.matrix.rotate(-90, 1,0,0);

    leftArm7.matrix.rotate(g_yellowAngle,1,0,0);
    var yellowCoordinatesMat7 = new Matrix4(leftArm7.matrix);
    leftArm7.matrix.scale(0.17, 0.5, 0.17);
    leftArm7.matrix.translate(0.05, -0.05, -4.3);
    leftArm7.render();
    
    var box7 = new Cube(0.98,0.68, 0.45,1);
    //box.color = [1,0,1,1];
    box7.matrix = yellowCoordinatesMat7;
    box7.matrix.rotate(45, 1 ,0,0);
    box7.matrix.rotate(g_magentaAngle, 1,0,0);
    box7.matrix.scale(0.14, 0.23, 0.14);
    box7.matrix.translate(0.26, -0.8, -6);
    box7.render();

    var top7 = new Cube(1,1,1,1);
    //top.color = [0,1,1,1];
    top7.matrix = yellowCoordinatesMat7;
    box7.matrix.rotate(-90, 0 ,1,0);
    top7.matrix.rotate(g_finalAngle, 0,0,1);
    top7.matrix.scale(0.7, 0.7, 0.7);
    top7.matrix.translate(0.3, 1.4, -1.2);
    top7.render();



    //arm 8 -----------------------------------------------------------------------------------------
    var leftArm8 = new Cube(0.98,0.68, 0.45,1);
    //leftArm.color = [1,1,0,1];
    leftArm8.matrix.rotate(-90, 0,1,0);
    leftArm8.matrix.rotate(-90, 1,0,0);

    leftArm8.matrix.rotate(g_yellowAngle,1,0,0);
    var yellowCoordinatesMat8 = new Matrix4(leftArm8.matrix);
    leftArm8.matrix.scale(0.17, 0.5, 0.17);
    leftArm8.matrix.translate(1.2, -0.05, -4.3);
    leftArm8.render();


    var box8 = new Cube(0.98,0.68, 0.45,1);
    //box.color = [1,0,1,1];
    box8.matrix = yellowCoordinatesMat8;
    box8.matrix.rotate(45, 1 ,0,0);
    box8.matrix.rotate(g_magentaAngle, 1,0,0);
    box8.matrix.scale(0.14, 0.23, 0.14);
    box8.matrix.translate(1.66, -0.8, -6);
    box8.render();


    var top8 = new Cube(1,1,1,1);
    //top.color = [0,1,1,1];
    top8.matrix = yellowCoordinatesMat8;
    box8.matrix.rotate(-90, 0 ,1,0);
    top8.matrix.rotate(g_finalAngle, 0,0,1);
    top8.matrix.scale(0.7, 0.7, 0.7);
    top8.matrix.translate(0.3, 1.4, -1.2);
    top8.render();
    // cone hat -------------------------------------------------
    var tester = new Cone();
    tester.matrix.rotate(-90,1,0,0);

    tester.render();


    // eyes 
    var eye = new Cube(0.2,0.2,0.2,1);
    eye.matrix.scale(0.08, 0.08, 0.08);
    //body.color = [1.0, 0.0, 0.0, 1.0];
    eye.matrix.translate(0.1, -6.2, -0.8);
    eye.matrix.scale(0.99, g_eyeYdim, 0.95);
    eye.render();

    // eyes 
    var eye2 = new Cube(0.2,0.2,0.2,1);
    eye2.matrix.scale(0.08, 0.08, 0.08);
    //body.color = [1.0, 0.0, 0.0, 1.0];
    eye2.matrix.translate(-2.2, -6.2, -0.8);
    eye2.matrix.scale(0.99, g_eyeYdim, 0.95);
    eye2.render();


    
    
    
    
}

function clicked(ev) {
    // Start the animation if it's not already in progress
    if (!animationInProgress) {
        animationInProgress = true;
        isEyeShrunk = !isEyeShrunk; // Toggle between eye states
        animateEye();
    }
}


function dragged(ev){
    let [x,y] = convertCordinatesEventToGL(ev);
    g_globalAngle =  x * 360;
    g_globalAngleY =  y * 360;
}
