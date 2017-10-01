
var range = (N): Array<any> => { return Array.apply(null, { length: N }).map(Function.call, Number) };

var getRandomNumber = (min, max) => {
    return (Math.random() * (max - min + 1)) + min;
}


// Given three colinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p: BABYLON.Vector3, q: BABYLON.Vector3, r: BABYLON.Vector3): boolean {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.z <= Math.max(p.z, r.z) && q.z >= Math.min(p.z, r.z)) {
        return true;
    }

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation2(p: BABYLON.Vector3, q: BABYLON.Vector3, r: BABYLON.Vector3): number {
    // See http://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.z - p.z) * (r.x - q.x) -
        (q.x - p.x) * (r.z - q.z);

    if (val == 0) return 0;  // colinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1: BABYLON.Vector3, q1: BABYLON.Vector3, p2: BABYLON.Vector3, q2: BABYLON.Vector3) {
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
    generatePolygon(point1: BABYLON.Vector3, point2: BABYLON.Vector3, numberOfSide: number): BABYLON.Path3D {
        let outputPoints = [point1, point2];
        let dist = BABYLON.Vector3.Distance(point1, point2);
        let sides = range(numberOfSide - 1);
        let count = 0;
        let done = false;
        //keep generating lines until we empty the sides array
        while (!done && count < 100000) {
            let intersects = false;
            //generate a set of random points for each side
            sides.forEach(sideIndex => {
                let newPoint = new BABYLON.Vector3(0, 0, 0);
                let randomVec = new BABYLON.Vector3(getRandomNumber(-1.0, 1.0), 0.0, getRandomNumber(-1.0, 1.0));

                //if we are on the last side, then the point added should just be the first point.
                if (sideIndex == numberOfSide - 2) {
                    //console.log("connecting last point");
                    newPoint = outputPoints[0];
                }
                else {
                    newPoint = (outputPoints[outputPoints.length - 1].add(randomVec.scale(dist * getRandomNumber(.1, 1.0))));
                }
                outputPoints.push(newPoint);
            });


            //check if the current polycurve self intersects
            outerLoop:
            for (let i = 0; i < outputPoints.length - 1; i += 1) {
                let A = outputPoints[i];
                let B = outputPoints[i + 1];
                for (let j = i + 1; j < outputPoints.length - 1; j += 1) {
                    let C = outputPoints[j];
                    let D = outputPoints[j + 1];

                    let fo = B.subtract(A);
                    let back = fo.scale(-1);
                    let fo2 = D.subtract(C);
                    let back2 = fo2.scale(-1);

                    //if any curve intersects in the polycurve then back up one point.
                    if (doIntersect(A.add(fo.scale(.1)),
                        B.add(back.scale(.1)),
                        C.add(fo2.scale(.1)),
                        D.add(back2.scale(.1)))) {
                        intersects = true;
                        //throw away entire solution and reset sides
                        outputPoints = [point1, point2];
                        break outerLoop;

                    }
                }
            } if (!intersects) {
                done = true;
            }
            count = count + 1;
        }
        //connect the last side
        if (count < 100000) {
            //console.log("we think we generated something valid with a count of " + count);
        }
        else {
            // console.log("we failed to generate a valid polygon, and the input was",
            //JSON.stringify(outputPoints), "length = ", BABYLON.Vector3.Distance(outputPoints[0], outputPoints[1]));
        }
        return new BABYLON.Path3D(outputPoints);
    }

    createScene(): void {
        // create a basic BJS Scene object
        this._scene = new BABYLON.Scene(this._engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this._scene);
        this._scene.clearColor = new BABYLON.Color3(0,0,0);
        // target the camera to scene origin
        this._camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        this._camera.attachControl(this._canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        // lights
        var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), this._scene);
        light.groundColor = new BABYLON.Color3(0.2, 0.2, 0.5);
        light.intensity = 0.6;
        var light2 = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-.5, -.5, 0), this._scene);
        light.intensity = 0.3;
        var light3 = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-.1, -.6, 0), this._scene);
        light.intensity = 0.3;


        BABYLON.Effect.ShadersStore["customVertexShader"] = `

    attribute vec3 position;
    uniform mat4 worldViewProjection;


    	varying vec2 vUv;

      void main() {
        gl_Position = worldViewProjection* vec4(position, 1.0);
      }`

        BABYLON.Effect.ShadersStore["customFragmentShader"] = `
vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}

vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 1.0 - 2.0 * rgb.xyz;
}

const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

const float ShiftRight8 = 1. / 256.;

vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8; // tidy overflow
	return r * PackUpscale;
}

float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}

// NOTE: viewZ/eyeZ is < 0 when in front of the camera per OpenGL conventions

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}

float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return (( near + viewZ ) * far ) / (( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

      uniform float cameraNear;
      uniform float cameraFar;

      float readDepth (float fragCoordZ ) {
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar);
        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar);
      }
      void main() {
        float depth = readDepth(gl_FragCoord.z);
        gl_FragColor.rgb = vec3(1.0-(depth*depth),1.0-(depth*depth),1.0-(depth*depth));
        gl_FragColor.a = 1.0;
      }`
    }


    animate(): void {
        // material
        var mat = new BABYLON.ShaderMaterial("mat1", this._scene,
            {
                vertex: "custom",
                fragment: "custom"
            },
            {
                attributes: ["position"],
                uniforms: [ "world", "worldView", "worldViewProjection", "view", "projection", "cameraNear", "cameraFar"]
            });
        mat.alpha = 1.0;
        mat.backFaceCulling = false;
        mat.setColor3("col", new BABYLON.Color3(255, 0, 0));
        console.log(this._camera.minZ, this._camera.maxZ);
        mat.setFloat("cameraNear", .1);
        mat.setFloat("cameraFar", 1);
 
        console.log("animate called");
        let polygons: BABYLON.Path3D[] = [];
        let polygonMeshs: BABYLON.LinesMesh[] = [];
        let normalLineMeshs: BABYLON.LinesMesh[] = []

        let randomPoints = [
            new BABYLON.Vector3(getRandomNumber(-3, 3), 0, getRandomNumber(-3, 3)),
            new BABYLON.Vector3(getRandomNumber(-3, 3), 0, getRandomNumber(-3, 3))];
        let firstPoly = this.generatePolygon(
            randomPoints[0], randomPoints[1],
            4);
        polygons.push(firstPoly);

        // run the render loop
        this._engine.runRenderLoop(() => {
            //get a random side of the last poly
            let polyindex = Math.floor(Math.random() * (polygons.length));
            let oldPoly = polygons[polyindex];
            let index = Math.floor(Math.random() * (oldPoly.getCurve().length - 1));
            let side = [oldPoly.getCurve()[index], oldPoly.getCurve()[index + 1]];
            let normal = oldPoly.getNormals()[index];

            let normal2 = oldPoly.getNormals()[index + 1];
            let randomNormalOffset = getRandomNumber(4, 15);
            let avnorm = ((normal.add(normal2)).scale(.5)).scale(randomNormalOffset);

            let translatedSide = [side[0].add(avnorm), side[1].add(avnorm)];
            let currentNorm = BABYLON.MeshBuilder.CreateLines(null, { points: [side[0], translatedSide[0]] }, this._scene);
            currentNorm.color = new BABYLON.Color3(255, 0, 0);
            currentNorm.alpha = .3;

            let newPoly = this.generatePolygon(translatedSide[0], translatedSide[1],
                4);

            let currentLine = BABYLON.MeshBuilder.CreateLines(null, { points: newPoly.getCurve() }, this._scene);

            let intersect = false;
            for (let mesh of polygonMeshs.concat(normalLineMeshs)) {
                if (mesh.intersectsMesh(currentLine) && mesh != currentLine) {
                    intersect = true;
                    break;
                }
            }
            if (intersect) {
                this._scene.removeMesh(currentLine);
                this._scene.removeMesh(currentNorm);
            } else {
                polygonMeshs.push(currentLine);
                normalLineMeshs.push(currentNorm);
                polygons.push(newPoly);

                let av: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
                newPoly.getCurve().forEach((point) => { av = av.add(point) });
                av = av.scale((1.0 / newPoly.getCurve().length));

                let convertedPath = newPoly.getCurve().map((point) => { return new BABYLON.Vector3((point.z - av.z) * -1.0, (point.x - av.x) * -1.0, 0) });
                let randomHeight = getRandomNumber(.5, 7);
                let path = [av, av.add(new BABYLON.Vector3(0, randomHeight, 0))];
                let extrusion = BABYLON.MeshBuilder.ExtrudeShape("ext", { shape: convertedPath, path, cap: 2 }, this._scene);
                extrusion.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
                extrusion.material = mat;
            }

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