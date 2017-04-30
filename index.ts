
var range = (N): Array<any> => { return Array.apply(null, { length: N }).map(Function.call, Number) };

var getRandomNumber = (min, max) => {
    return (Math.random() * (max - min + 1)) + min;
}


// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p:BABYLON.Vector3, q:BABYLON.Vector3 , r:BABYLON.Vector3 ):boolean
{
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.z <= Math.max(p.z, r.z) && q.z >= Math.min(p.z, r.z))
       return true;
 
    return false;
}
 
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation2( p:BABYLON.Vector3, q:BABYLON.Vector3,  r:BABYLON.Vector3):number
{
    // See http://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.z - p.z) * (r.x - q.x) -
              (q.x - p.x) * (r.z - q.z);
 
    if (val == 0) return 0;  // colinear
 
    return (val > 0)? 1: 2; // clock or counterclock wise
}
 
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect( p1:BABYLON.Vector3,  q1:BABYLON.Vector3,  p2:BABYLON.Vector3,  q2:BABYLON.Vector3)
{
    // Find the four orientations needed for general and
    // special cases
    let o1 = orientation2(p1, q1, p2);
    let o2 = orientation2(p1, q1, q2);
    let o3 = orientation2(p2, q2, p1);
    let o4 = orientation2(p2, q2, q1);
 
    // General case
    if (o1 != o2 && o3 != o4)
        return true;
 
    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
 
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
 
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
 
     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
 
    return false; // Doesn't fall in any of the above cases
}




class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;

    constructor(canvasElement: string) {
        // Create canvas and engine
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
    }



  isIntersecting2(p1: BABYLON.Vector3, p2: BABYLON.Vector3, p3: BABYLON.Vector3, p4: BABYLON.Vector3): Boolean {
      var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}     
let x1 = p1.x;
let x2 = p2.x;
let x3 = p3.x;
let x4 = p4.x;
let y1 = p1.z;
let y2 = p2.z;
let y3 = p3.z;
let y4 = p4.z;
    // Adapted from http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return true;
}
    //check if two lines intersect
    isIntersecting(p1: BABYLON.Vector3, p2: BABYLON.Vector3, p3: BABYLON.Vector3, p4: BABYLON.Vector3): Boolean {
        function CCW(p1: BABYLON.Vector3, p2: BABYLON.Vector3, p3: BABYLON.Vector3) {
            return (p3.z - p1.z) * (p2.x - p1.x) > (p2.z - p1.z) * (p3.x - p1.x);
        }
        return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
    }

    generatePolygon(point1: BABYLON.Vector3, point2: BABYLON.Vector3, numberOfSide: number): BABYLON.Path3D {
        let outputPoints = [point1, point2];
        let dist = BABYLON.Vector3.Distance(point1, point2);
        let sides = range(numberOfSide);
        let count = 0;
        //keep generating lines until we empty the sides array
        while (sides.length > 1 && count < 100000) {
            //console.log("side" + sides.length);
            let newPoint = new BABYLON.Vector3(0, 0, 0);
            let intersects = false;
            let randomVec = new BABYLON.Vector3(getRandomNumber(-1.0, 1.0), 0.0, getRandomNumber(-1.0, 1.0));

            //if we are on the last side, then the point added should just be the first point.
            if (sides.length == 2) {
                console.log("connecting last point");
                newPoint = outputPoints[0];
            }
            else {
                newPoint = (outputPoints[outputPoints.length - 1].add(randomVec.scale(dist * getRandomNumber(.1, 1.0))));

            }
            outputPoints.push(newPoint);
            //check if the current polycurve self intersects
            outerLoop:
            //lengths are too high - should be divided by 2.
            for (let i = 0; i < outputPoints.length-1; i += 1) {
                let A = outputPoints[i];
                let B = outputPoints[i + 1];
                for (let j = 1; j < outputPoints.length-1; j += 1) {
                    let C = outputPoints[j];
                    let D = outputPoints[j + 1];

                    let back = A.subtract(B).normalize();
                    let fo = B.subtract(A).normalize();
                    let back2 = C.subtract(D).normalize();
                    let fo2 = D.subtract(C).normalize();
                    //if any curve intersects in the polycurve then back up one point.
                    if (doIntersect(A.add(fo.scale(.5)),
                     B.add(back.scale(.5)),
                      C.add(fo2.scale(.5)), 
                      D.add(back2.scale(.5)))) {
                        //throw away entire solution and reset sides
                        outputPoints = [point1, point2];
                        sides = range(numberOfSide);
                        intersects = true;
                        console.log("intersection at count " + count);
                        break outerLoop;

                    }
                }
            }
            count = count + 1;
            if (!intersects) {
                sides.shift();
            }
            //reduce sides so we eventually finish - only reduce when we don't
            //intersect

        }
        //connect the last side
        if(count<100000){
            console.log("we think we generated something valid with a count of " + count);
        }
        else{
            console.log("we failed to generate a valid polygon");
        }
        return new BABYLON.Path3D(outputPoints);
    }

    createScene(): void {
        // create a basic BJS Scene object
        this._scene = new BABYLON.Scene(this._engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this._scene);

        // target the camera to scene origin
        this._camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        this._camera.attachControl(this._canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);


        let paths = range(10).map((polys)=>
        {   let translation =  new BABYLON.Vector3(getRandomNumber(-50,50), 0, getRandomNumber(-50,50))
            return this.generatePolygon(
            new BABYLON.Vector3(getRandomNumber(1,10), 0, getRandomNumber(1,10)).add(translation), 
            new BABYLON.Vector3(getRandomNumber(1,10), 0, getRandomNumber(1,10)).add(translation), 
            5)});

        let lineMeshes = paths.map((path)=>{return BABYLON.MeshBuilder.CreateLines("poly1", { points: path.getCurve() }, this._scene)});

    }

    animate(): void {
        // run the render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'
    let game = new Game('renderCanvas');

    // Create the scene
    game.createScene();

    // start animation
    game.animate();
});