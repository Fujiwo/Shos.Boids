"use strict";
/// <reference path="three.d.ts" />
var Shos;
(function (Shos) {
    var Boids;
    (function (Boids) {
        var Core3DS;
        (function (Core3DS) {
            var Helper;
            (function (Helper) {
                var Vector3D = /** @class */ (function () {
                    function Vector3D(x, y, z) {
                        if (x === void 0) { x = 0; }
                        if (y === void 0) { y = 0; }
                        if (z === void 0) { z = 0; }
                        this.x = x;
                        this.y = y;
                        this.z = z;
                    }
                    Object.defineProperty(Vector3D.prototype, "absoluteValue", {
                        get: function () {
                            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Vector3D.prototype.clone = function () {
                        return new Vector3D(this.x, this.y, this.z);
                    };
                    Vector3D.prototype.plus = function (another) {
                        return new Vector3D(this.x + another.x, this.y + another.y, this.z + another.z);
                    };
                    Vector3D.prototype.plusEqual = function (another) {
                        this.x += another.x;
                        this.y += another.y;
                        this.z += another.z;
                    };
                    Vector3D.prototype.minus = function (another) {
                        return new Vector3D(this.x - another.x, this.y - another.y, this.z - another.z);
                    };
                    Vector3D.prototype.minusEqual = function (another) {
                        this.x -= another.x;
                        this.y -= another.y;
                        this.z -= another.z;
                    };
                    Vector3D.prototype.multiply = function (value) {
                        return new Vector3D(this.x * value, this.y * value, this.z * value);
                    };
                    Vector3D.prototype.innerProduct = function (another) {
                        return new Vector3D(this.x * another.x, this.y * another.y, this.z * another.z);
                    };
                    Vector3D.prototype.divideBy = function (value) {
                        return new Vector3D(this.x / value, this.y / value, this.z / value);
                    };
                    Vector3D.prototype.divideByEqual = function (value) {
                        this.x /= value;
                        this.y /= value;
                        this.z /= value;
                    };
                    Vector3D.prototype.getDistance = function (another) {
                        return this.minus(another).absoluteValue;
                    };
                    return Vector3D;
                }());
                Helper.Vector3D = Vector3D;
            })(Helper = Core3DS.Helper || (Core3DS.Helper = {}));
        })(Core3DS = Boids.Core3DS || (Boids.Core3DS = {}));
    })(Boids = Shos.Boids || (Shos.Boids = {}));
})(Shos || (Shos = {}));
(function (Shos) {
    var Boids;
    (function (Boids_1) {
        var Core3DS;
        (function (Core3DS) {
            var Vector3D = Shos.Boids.Core3DS.Helper.Vector3D;
            var Boid = /** @class */ (function () {
                function Boid(position, velocity, color, opacity) {
                    if (position === void 0) { position = new Vector3D(); }
                    if (velocity === void 0) { velocity = new Vector3D(); }
                    if (color === void 0) { color = 0xffffff; }
                    if (opacity === void 0) { opacity = 1.0; }
                    this.position = position;
                    this.velocity = velocity;
                    this.color_ = color;
                    this.opacity_ = opacity;
                }
                Object.defineProperty(Boid.prototype, "color", {
                    get: function () {
                        return this.color_;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Boid.prototype, "opacity", {
                    get: function () {
                        return this.opacity_;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Boid.prototype, "speed", {
                    get: function () {
                        return this.velocity.absoluteValue;
                    },
                    enumerable: true,
                    configurable: true
                });
                Boid.prototype.move = function () {
                    this.velocity.plusEqual(Boid.getRandomVector());
                    this.position.plusEqual(this.velocity);
                };
                Boid.prototype.getDistance = function (another) {
                    return this.position.getDistance(another.position);
                };
                Boid.getRandomVector = function () {
                    return new Vector3D(Boid.getRandomDistance(), Boid.getRandomDistance(), Boid.getRandomDistance());
                };
                Boid.getRandomDistance = function () {
                    return Boid.maximumRandomDistance * (Math.random() + Math.random()) - Boid.maximumRandomDistance;
                };
                Boid.defaultMaximumRandomDistance = 2;
                Boid.maximumRandomDistance = Boid.defaultMaximumRandomDistance;
                return Boid;
            }());
            Core3DS.Boid = Boid;
            var Boids = /** @class */ (function () {
                function Boids() {
                    this.boids = [];
                }
                Boids.prototype.append = function (boid) {
                    this.boids.push(boid);
                };
                Boids.prototype.move = function (size) {
                    var sum = this.getSum();
                    var boidCount = this.boids.length;
                    for (var index = 0; index < boidCount; index++) {
                        var boid = this.boids[index];
                        var speed = boid.speed;
                        this.cohesion(sum.position, boid);
                        this.separation(index);
                        this.alignment(sum.velocity, boid);
                        if (speed >= Boids.maximumSpeed)
                            boid.velocity = boid.velocity.multiply(Boids.maximumSpeed / speed);
                        if (boid.position.x < 0 && boid.velocity.x < 0 || boid.position.x > size.x && boid.velocity.x > 0)
                            boid.velocity.x *= -1;
                        if (boid.position.y < 0 && boid.velocity.y < 0 || boid.position.y > size.y && boid.velocity.y > 0)
                            boid.velocity.y *= -1;
                        if (boid.position.z < 0 && boid.velocity.z < 0 || boid.position.z > size.z && boid.velocity.z > 0)
                            boid.velocity.z *= -1;
                        boid.move();
                    }
                };
                Boids.prototype.getSum = function () {
                    var sum = new Boid();
                    var boidCount = this.boids.length;
                    for (var index = 0; index < boidCount; index++) {
                        sum.position.plusEqual(this.boids[index].position);
                        sum.velocity.plusEqual(this.boids[index].velocity);
                    }
                    return sum;
                };
                Boids.prototype.cohesion = function (sum, boid) {
                    var center = sum.clone();
                    center.minusEqual(boid.position);
                    center.divideByEqual(this.boids.length - 1);
                    boid.velocity.plusEqual(center.minus(boid.position).divideBy(Boids.cohesionParameter));
                };
                Boids.prototype.separation = function (index) {
                    for (var i = 0, length_1 = this.boids.length; i < length_1; i++) {
                        if (i === index)
                            continue;
                        if (this.boids[i].getDistance(this.boids[index]) < Boids.separationParameter)
                            this.boids[index].velocity.minusEqual(this.boids[i].position.minus(this.boids[index].position));
                    }
                };
                Boids.prototype.alignment = function (sum, boid) {
                    var average = sum.clone();
                    average.minusEqual(boid.velocity);
                    average.divideByEqual(this.boids.length - 1);
                    boid.velocity.plusEqual(average.minus(boid.velocity).divideBy(Boids.alignmentParameter));
                };
                Boids.defaultInitialBoidCount = 250;
                Boids.defaultMaximumSpeed = 12;
                Boids.defaultCohesionParameter = 100;
                Boids.defaultSeparationParameter = 16;
                Boids.defaultAlignmentParameter = 7;
                Boids.initialBoidCount = Boids.defaultInitialBoidCount;
                Boids.maximumSpeed = Boids.defaultMaximumSpeed;
                Boids.cohesionParameter = Boids.defaultCohesionParameter;
                Boids.separationParameter = Boids.defaultSeparationParameter;
                Boids.alignmentParameter = Boids.defaultAlignmentParameter;
                return Boids;
            }());
            Core3DS.Boids = Boids;
        })(Core3DS = Boids_1.Core3DS || (Boids_1.Core3DS = {}));
    })(Boids = Shos.Boids || (Shos.Boids = {}));
})(Shos || (Shos = {}));
(function (Shos) {
    var Boids;
    (function (Boids_2) {
        var Application3D2;
        (function (Application3D2) {
            var Vector3D = Shos.Boids.Core3DS.Helper.Vector3D;
            var Boids = Shos.Boids.Core3DS.Boids;
            var Boid = Shos.Boids.Core3DS.Boid;
            var Material;
            (function (Material) {
                Material[Material["Basic"] = 0] = "Basic";
                Material[Material["Standard"] = 1] = "Standard";
                Material[Material["Normal"] = 2] = "Normal";
                Material[Material["Lambert"] = 3] = "Lambert";
                Material[Material["Phong"] = 4] = "Phong";
                Material[Material["First"] = 0] = "First";
                Material[Material["Last"] = 4] = "Last";
            })(Material || (Material = {}));
            var Screen = /** @class */ (function () {
                //private areaMesh: THREE.Mesh;
                function Screen(canvas, parallax) {
                    this.onMouseDown = function (clickedPosition) { };
                    this.onMouseUp = function () { };
                    this.size = new Vector3D(1000, 1000);
                    this.scene = new THREE.Scene();
                    this.camera = new THREE.PerspectiveCamera(45, this.size.x / this.size.y, 1, 100000);
                    this.meshes = [];
                    this.parallax = 0;
                    this.canvas = canvas;
                    this.parallax = parallax;
                    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
                    this.renderer.setPixelRatio(window.devicePixelRatio);
                    this.renderer.setSize(this.size.x, this.size.y);
                    this.setCamera();
                    this.setLight();
                    //this.areaMesh = this.createAreaMesh();
                    this.bindEvents();
                }
                Screen.prototype.moveCamera = function (offset) {
                    this.camera.position.addVectors(this.camera.position, offset);
                };
                Screen.prototype.update = function () {
                    var panel = document.getElementById("panel");
                    this.size.x = Math.round(window.innerWidth / 2 * Screen.sizeRate);
                    var screenHeight = Screen.getScreenHeight();
                    this.size.y = Math.round(Math.max(this.size.x * Screen.heightRate, screenHeight * Screen.sizeRate));
                    if (this.size.y > screenHeight)
                        window.resizeBy(0, this.size.y - screenHeight);
                    this.size.z = Math.sqrt(this.size.x * this.size.y);
                    this.renderer.setSize(this.size.x, this.size.y);
                    this.resetCamera();
                    //this.updateAreaMesh();
                };
                Screen.prototype.drawBoids = function (boids) {
                    this.updateMeshes(boids);
                    this.createMeshes(boids);
                    this.renderer.render(this.scene, this.camera);
                };
                Screen.prototype.bindEvents = function () {
                    var _this = this;
                    this.canvas.addEventListener("mousedown", function (e) { return _this.onMouseDown(Screen.getMousePosition(_this.canvas, e)); });
                    this.canvas.addEventListener("touchstart", function (e) { return _this.onMouseDown(Screen.getTouchPosition(_this.canvas, e)); });
                    this.canvas.addEventListener("mouseup", function () { return _this.onMouseUp(); });
                    this.canvas.addEventListener("touchend", function () { return _this.onMouseUp(); });
                };
                Screen.getScreenHeight = function () {
                    var header = document.getElementById("header");
                    var footer = document.getElementById("footer");
                    return window.innerHeight - (header == null ? 0 : header.clientHeight) - (footer == null ? 0 : footer.clientHeight);
                };
                Screen.getMousePosition = function (element, e) {
                    var rect = element.getBoundingClientRect();
                    return new Vector3D(e.clientX - rect.left, e.clientY - rect.top);
                };
                Screen.getTouchPosition = function (element, e) {
                    var rect = element.getBoundingClientRect();
                    var touch = e.changedTouches[0];
                    return new Vector3D(touch.clientX - rect.left, touch.clientY - rect.top);
                };
                Screen.prototype.setCamera = function () {
                    this.camera.position.set(this.size.x / 2 + this.parallax, this.size.y / 2, Screen.defaultCameraDistance);
                    this.camera.lookAt(new THREE.Vector3(this.size.x / 2 + this.parallax, this.size.y / 2, 0));
                };
                Screen.prototype.resetCamera = function () {
                    this.camera.aspect = this.size.x / this.size.y;
                    this.camera.position.set(this.size.x / 2 + this.parallax, this.size.y / 2, this.camera.position.z);
                    this.camera.lookAt(new THREE.Vector3(this.size.x / 2 + this.parallax, this.size.y / 2, 0));
                };
                Screen.prototype.setLight = function () {
                    this.scene.add(new THREE.DirectionalLight(0xffffff, Screen.defaultDirectionalLight));
                    this.scene.add(new THREE.AmbientLight(0xffffff, Screen.defaultAmbientLight));
                };
                Screen.prototype.setRotation = function (mesh, boid) {
                    mesh.rotation.x = Math.atan2(boid.velocity.z, boid.velocity.y);
                    mesh.rotation.y = 0;
                    mesh.rotation.z = -Math.atan2(boid.velocity.x, boid.velocity.y);
                };
                Screen.prototype.updateMeshes = function (boids) {
                    for (var index = 0, meshLength = this.meshes.length; index < meshLength; index++) {
                        var boid = boids.boids[index];
                        this.meshes[index].position.set(boid.position.x, boid.position.y, boid.position.z);
                        this.setRotation(this.meshes[index], boid);
                    }
                };
                Screen.prototype.createMeshes = function (boids) {
                    for (var index = this.meshes.length, boidsLength = boids.boids.length; this.meshes.length < boidsLength; index++) {
                        var boid = boids.boids[index];
                        var coneGeometry = new THREE.ConeGeometry(Screen.boidSize, Screen.boidSize * 7, 6);
                        var material;
                        switch (Screen.boidMaterial) {
                            case Material.Standard:
                                material = new THREE.MeshStandardMaterial({ color: boid.color, transparent: true, opacity: boid.opacity });
                                break;
                            case Material.Normal:
                                material = new THREE.MeshNormalMaterial({ transparent: true, opacity: boid.opacity });
                                break;
                            case Material.Lambert:
                                material = new THREE.MeshLambertMaterial({ color: boid.color, transparent: true, opacity: boid.opacity });
                                break;
                            case Material.Phong:
                                material = new THREE.MeshPhongMaterial({ color: boid.color, transparent: true, opacity: boid.opacity });
                                break;
                            default:
                                material = new THREE.MeshBasicMaterial({ color: boid.color, transparent: true, opacity: boid.opacity });
                                break;
                        }
                        var mesh = new THREE.Mesh(coneGeometry, material);
                        mesh.position.set(boid.position.x, boid.position.y, boid.position.z);
                        this.setRotation(mesh, boid);
                        this.scene.add(mesh);
                        this.meshes.push(mesh);
                    }
                };
                Screen.heightRate = 0.6180339887498948;
                Screen.defaultCameraDistance = 3000;
                Screen.defaultDirectionalLight = 2.0;
                Screen.defaultAmbientLight = 0.5;
                Screen.defaultBoidSize = 6;
                Screen.boidSize = Screen.defaultBoidSize;
                Screen.defaultBoidMaterial = Material.Standard;
                Screen.boidMaterial = Screen.defaultBoidMaterial;
                Screen.sizeRate = 0.95;
                return Screen;
            }());
            var FreeViewingStereoscopy;
            (function (FreeViewingStereoscopy) {
                FreeViewingStereoscopy[FreeViewingStereoscopy["CrossEyed"] = 0] = "CrossEyed";
                FreeViewingStereoscopy[FreeViewingStereoscopy["Parallel"] = 1] = "Parallel";
                FreeViewingStereoscopy[FreeViewingStereoscopy["First"] = 0] = "First";
                FreeViewingStereoscopy[FreeViewingStereoscopy["Last"] = 1] = "Last";
            })(FreeViewingStereoscopy || (FreeViewingStereoscopy = {}));
            var View = /** @class */ (function () {
                function View() {
                    var _this = this;
                    this.onMouseDown = function (clickedPosition) { };
                    this.onMouseUp = function () { };
                    this.leftScreen = new Screen(document.querySelector("#leftCanvas"), View.parallax);
                    this.rightScreen = new Screen(document.querySelector("#rightCanvas"), -View.parallax);
                    this.leftScreen.onMouseDown = this.rightScreen.onMouseDown = function (position) { return _this.onMouseDown(position); };
                    this.leftScreen.onMouseUp = this.rightScreen.onMouseUp = function () { return _this.onMouseUp(); };
                }
                Object.defineProperty(View, "parallax", {
                    get: function () {
                        switch (View.freeViewingStereoscopy) {
                            case FreeViewingStereoscopy.CrossEyed: return View.defaultParallax;
                            case FreeViewingStereoscopy.Parallel: return -View.defaultParallax;
                        }
                        return 0;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(View.prototype, "size", {
                    get: function () {
                        return this.leftScreen.size;
                    },
                    enumerable: true,
                    configurable: true
                });
                View.prototype.moveCamera = function (offset) {
                    this.leftScreen.moveCamera(offset);
                    this.rightScreen.moveCamera(offset);
                };
                View.prototype.update = function () {
                    this.leftScreen.update();
                    this.rightScreen.update();
                };
                View.prototype.drawBoids = function (boids) {
                    this.leftScreen.drawBoids(boids);
                    this.rightScreen.drawBoids(boids);
                };
                View.defaultFreeViewingStereoscopy = FreeViewingStereoscopy.CrossEyed;
                View.freeViewingStereoscopy = View.defaultFreeViewingStereoscopy;
                View.defaultParallax = 200;
                return View;
            }());
            var Settings = /** @class */ (function () {
                function Settings() {
                }
                Settings.get = function () {
                    return {
                        boidSize: Screen.boidSize,
                        boidMaterial: Screen.boidMaterial,
                        freeViewingStereoscopy: View.freeViewingStereoscopy,
                        randomParameter: Boid.maximumRandomDistance,
                        initialBoidCount: Boids.initialBoidCount,
                        maximumSpeed: Boids.maximumSpeed,
                        cohesionParameter: Boids.cohesionParameter,
                        separationParameter: Boids.separationParameter,
                        alignmentParameter: Boids.alignmentParameter
                    };
                };
                Settings.set = function (boidSize, boidMaterial, freeViewingStereoscopy, randomParameter, initialBoidCount, maximumSpeed, cohesionParameter, separationParameter, alignmentParameter) {
                    Screen.boidSize = boidSize;
                    Screen.boidMaterial = Settings.toMaterial(boidMaterial);
                    View.freeViewingStereoscopy = Settings.toFreeViewingStereoscopy(freeViewingStereoscopy);
                    Boid.maximumRandomDistance = randomParameter;
                    Boids.initialBoidCount = initialBoidCount;
                    Boids.maximumSpeed = maximumSpeed;
                    Boids.cohesionParameter = cohesionParameter;
                    Boids.separationParameter = separationParameter;
                    Boids.alignmentParameter = alignmentParameter;
                };
                Settings.toMaterial = function (value) {
                    if (value < Material.First)
                        return Material.First;
                    if (value > Material.Last)
                        return Material.Last;
                    return value;
                };
                Settings.toFreeViewingStereoscopy = function (value) {
                    if (value < FreeViewingStereoscopy.First)
                        return FreeViewingStereoscopy.First;
                    if (value > FreeViewingStereoscopy.Last)
                        return FreeViewingStereoscopy.Last;
                    return value;
                };
                Settings.reset = function () {
                    Screen.boidSize = Screen.defaultBoidSize;
                    Screen.boidMaterial = Screen.defaultBoidMaterial;
                    View.freeViewingStereoscopy = View.defaultFreeViewingStereoscopy;
                    Boid.maximumRandomDistance = Boid.defaultMaximumRandomDistance;
                    Boids.initialBoidCount = Boids.defaultInitialBoidCount;
                    Boids.maximumSpeed = Boids.defaultMaximumSpeed;
                    Boids.cohesionParameter = Boids.defaultCohesionParameter;
                    Boids.separationParameter = Boids.defaultSeparationParameter;
                    Boids.alignmentParameter = Boids.defaultAlignmentParameter;
                };
                Settings.save = function () {
                    if (!window.localStorage)
                        return false;
                    window.localStorage.setItem(Settings.key, JSON.stringify(Settings.get()));
                    return true;
                };
                Settings.load = function () {
                    if (!window.localStorage)
                        return false;
                    var jsonText = window.localStorage.getItem(Settings.key);
                    if (jsonText == null)
                        return false;
                    var data = JSON.parse(jsonText);
                    if (data == null)
                        return false;
                    Settings.set(data.boidSize, data.boidMaterial, data.freeViewingStereoscopy, data.randomParameter, data.initialBoidCount, data.maximumSpeed, data.cohesionParameter, data.separationParameter, data.alignmentParameter);
                    return true;
                };
                Settings.key = "ShoBoids3DS";
                return Settings;
            }());
            var SettingsPanel = /** @class */ (function () {
                function SettingsPanel() {
                }
                SettingsPanel.initialize = function () {
                    SettingsPanel.initializeHandlers();
                    SettingsPanel.initializeForm();
                };
                SettingsPanel.initializeHandlers = function () {
                    document.getElementById("submitButton").onclick = SettingsPanel.onFormSubmit;
                    document.getElementById("resetButton").onclick = SettingsPanel.onReset;
                    document.getElementById("reloadButton").onclick = SettingsPanel.onReload;
                    document.getElementById("boidMaterialSelect").onchange = SettingsPanel.onFormSubmit;
                    document.getElementById("freeViewingStereoscopySelect").onchange = SettingsPanel.onFormSubmit;
                    //this.setFreeViewingStereoscopyHandlers();
                    SettingsPanel.enableEnterKey("boidSizeTextBox");
                    SettingsPanel.enableEnterKey("randomParameterTextBox");
                    SettingsPanel.enableEnterKey("initialBoidCountTextBox");
                    SettingsPanel.enableEnterKey("maximumSpeedTextBox");
                    SettingsPanel.enableEnterKey("cohesionParameterTextBox");
                    SettingsPanel.enableEnterKey("separationParameterTextBox");
                    SettingsPanel.enableEnterKey("alignmentParameterTextBox");
                };
                // private static setFreeViewingStereoscopyHandlers(): void  {
                //     let freeViewingStereoscopyElements = document.getElementsByName("freeViewingStereoscopy");
                //     for (let index = 0; index < freeViewingStereoscopyElements.length; index++)
                //         (<HTMLInputElement>freeViewingStereoscopyElements[index]).onclick = SettingsPanel.onFormSubmit;
                // }
                SettingsPanel.onFormSubmit = function () {
                    SettingsPanel.setSettingsFromForm();
                    SettingsPanel.initializeForm();
                };
                SettingsPanel.onReload = function () {
                    SettingsPanel.setSettingsFromForm();
                    window.location.reload(false);
                };
                SettingsPanel.setSettingsFromForm = function () {
                    var settingForm = document.settingForm;
                    Settings.set(Number(settingForm.boidSizeTextBox.value), 
                    // this.getFreeViewingStereoscopy(                    ),
                    document.getElementById("boidMaterialSelect").selectedIndex, document.getElementById("freeViewingStereoscopySelect").selectedIndex, Number(settingForm.randomParameterTextBox.value), Number(settingForm.initialBoidCountTextBox.value), Number(settingForm.maximumSpeedTextBox.value), Number(settingForm.cohesionParameterTextBox.value), Number(settingForm.separationParameterTextBox.value), Number(settingForm.alignmentParameterTextBox.value));
                    Settings.save();
                };
                SettingsPanel.onReset = function () {
                    Settings.reset();
                    Settings.save();
                    SettingsPanel.initializeForm();
                };
                SettingsPanel.initializeForm = function () {
                    var settings = Settings.get();
                    SettingsPanel.setToInput("boidSizeTextBox", settings.boidSize);
                    // this.setFreeViewingStereoscopy(settings.freeViewingStereoscopy                     );
                    SettingsPanel.setToInput("randomParameterTextBox", settings.randomParameter);
                    SettingsPanel.setToInput("initialBoidCountTextBox", settings.initialBoidCount);
                    SettingsPanel.setToInput("maximumSpeedTextBox", settings.maximumSpeed);
                    SettingsPanel.setToInput("cohesionParameterTextBox", settings.cohesionParameter);
                    SettingsPanel.setToInput("separationParameterTextBox", settings.separationParameter);
                    SettingsPanel.setToInput("alignmentParameterTextBox", settings.alignmentParameter);
                    document.getElementById("boidMaterialSelect").selectedIndex = settings.boidMaterial;
                    document.getElementById("freeViewingStereoscopySelect").selectedIndex = settings.freeViewingStereoscopy;
                };
                SettingsPanel.setToInput = function (inputName, value) {
                    var elements = document.getElementsByName(inputName);
                    if (elements.length > 0)
                        (elements[0]).value = String(value);
                };
                SettingsPanel.enableEnterKey = function (inputName) {
                    var elements = document.getElementsByName(inputName);
                    if (elements.length > 0)
                        elements[0].addEventListener("keypress", SettingsPanel.onKeyPress);
                };
                SettingsPanel.onKeyPress = function () {
                    if (window.event != null && window.event.keyCode == 13)
                        SettingsPanel.onFormSubmit();
                };
                return SettingsPanel;
            }());
            var Program = /** @class */ (function () {
                function Program() {
                    var _this = this;
                    this.appendTimer = 0;
                    Settings.load();
                    this.boids = new Boids();
                    this.view = new View();
                    setTimeout(function () { return _this.initialize(); }, Program.startTime);
                }
                Program.prototype.initialize = function () {
                    var _this = this;
                    this.bindEvents();
                    this.view.update();
                    this.appendBoids(Boids.initialBoidCount);
                    setTimeout(function () { return _this.step(); }, Program.startTime);
                    SettingsPanel.initialize();
                };
                Program.prototype.bindEvents = function () {
                    var _this = this;
                    this.view.onMouseDown = function (position) { return _this.appendBoids(1, position); };
                    this.view.onMouseUp = function () { return clearInterval(_this.appendTimer); };
                    // this.view.canvas.addEventListener("mousedown", e => this.appendBoids(1, Program.getMousePosition(this.view.canvas, e)));
                    // this.view.canvas.addEventListener("touchstart", e => this.appendBoids(1, Program.getTouchPosition(this.view.canvas, e)));
                    // this.view.canvas.addEventListener("mouseup", () => clearInterval(this.appendTimer));
                    // this.view.canvas.addEventListener("touchend", () => clearInterval(this.appendTimer));
                    window.addEventListener("resize", function () { return _this.view.update(); });
                    document.getElementById("forwardButton").onclick = function () { return _this.view.moveCamera(new THREE.Vector3(0, 0, -1000)); };
                    document.getElementById("backwardButton").onclick = function () { return _this.view.moveCamera(new THREE.Vector3(0, 0, 1000)); };
                };
                Program.prototype.appendBoids = function (count, position) {
                    var _this = this;
                    var index = 0;
                    this.appendTimer = setInterval(function () {
                        if (count > 0 && index >= count) {
                            clearInterval(_this.appendTimer);
                            return;
                        }
                        _this.boids.append(Program.createBoid(_this.view.size, position));
                        index++;
                    }, Program.createTime);
                };
                Program.createBoid = function (areaSize, position) {
                    return new Boid(position || areaSize.innerProduct(new Vector3D(Math.random(), Math.random(), Math.random())), new Vector3D(), this.getRandomColor(), this.getOpactiy());
                };
                Program.getRandomColor = function () {
                    return Program.getRandomColorValue() * (0x100 * 0x100) + Program.getRandomColorValue() * 0x100 + Program.getRandomColorValue();
                };
                Program.getRandomColorValue = function () {
                    return Math.round(0xff - Math.random() * Program.colorValueBase);
                };
                Program.getOpactiy = function () {
                    return Math.round(Math.random() * (Program.opacityBase2 - Program.opacityBase1) + Program.opacityBase1);
                };
                Program.prototype.step = function () {
                    var _this = this;
                    this.view.drawBoids(this.boids);
                    this.boids.move(this.view.size);
                    requestAnimationFrame(function () { return _this.step(); });
                };
                Program.createTime = 15;
                Program.startTime = 300;
                Program.colorValueBase = 0x40; // 0x00~0xff
                Program.opacityBase1 = 0.40; // 0.0~opacityBase2
                Program.opacityBase2 = 0.60; // opacityBase1~1.0
                return Program;
            }());
            onload = function () { return new Program(); };
        })(Application3D2 = Boids_2.Application3D2 || (Boids_2.Application3D2 = {}));
    })(Boids = Shos.Boids || (Shos.Boids = {}));
})(Shos || (Shos = {}));
//# sourceMappingURL=boids3ds.js.map