﻿namespace Shos.Boids.Core2D.Helper {
    export class Vector2D {
        x: number;
        y: number;

        get absoluteValue(): number {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        constructor(x: number = 0, y: number = 0) {
            this.x = x;
            this.y = y;
        }

        clone(): Vector2D {
            return new Vector2D(this.x, this.y);
        }

        plus(another: Vector2D): Vector2D {
            return new Vector2D(this.x + another.x, this.y + another.y);
        }

        plusEqual(another: Vector2D): void {
            this.x += another.x;
            this.y += another.y;
        }

        minus(another: Vector2D): Vector2D {
            return new Vector2D(this.x - another.x, this.y - another.y);
        }

        minusEqual(another: Vector2D): void {
            this.x -= another.x;
            this.y -= another.y;
        }

        multiply(value: number): Vector2D {
            return new Vector2D(this.x * value, this.y * value);
        }

        innerProduct(another: Vector2D): Vector2D {
            return new Vector2D(this.x * another.x, this.y * another.y);
        }

        divideBy(value: number): Vector2D {
            return new Vector2D(this.x / value, this.y / value);
        }

        divideByEqual(value: number): void {
            this.x /= value;
            this.y /= value;
        }

        getDistance(another: Vector2D): number {
            return this.minus(another).absoluteValue;
        }
    } 
}

namespace Shos.Boids.Core2D {
    import Vector2D =  Shos.Boids.Core2D.Helper.Vector2D;

    export class Boid {
        static defaultSize                  = 4;
        static defaultMaximumRandomDistance = 2;

        static size                         = Boid.defaultSize;
        static maximumRandomDistance        = Boid.defaultMaximumRandomDistance;

        position     : Vector2D;
        velocity     : Vector2D;
        private color: string  ;

        get speed(): number {
            return this.velocity.absoluteValue;
        }

        constructor(position: Vector2D = new Vector2D(), velocity: Vector2D = new Vector2D(), color: string = "black") {
            this.position = position;
            this.velocity = velocity;
            this.color    = color   ;
        }

        draw(context: CanvasRenderingContext2D): void {
            this.drawShape(context, this.position, Boid.size, this.color);
        }

        move(): void {
            this.velocity.plusEqual(Boid.getRandomVector());
            this.position.plusEqual(this.velocity);
        }

        getDistance(another: Boid): number {
            return this.position.getDistance(another.position);
        }

        private drawShape(context: CanvasRenderingContext2D, center: Vector2D, size: number, color: string) {
            let halfVelocity          = this.velocity.multiply(size / 2);
            let point1                = this.position.plus(halfVelocity);
            let middlePoint           = this.position.minus(halfVelocity);
            let velocityAbsoluteValue = this.velocity.absoluteValue;
            let unitVelocity          = this.velocity.multiply(size / (velocityAbsoluteValue * velocityAbsoluteValue));
            let point2                = middlePoint.plus(new Vector2D( unitVelocity.y, -unitVelocity.x));
            let point3                = middlePoint.plus(new Vector2D(-unitVelocity.y,  unitVelocity.x));
            Boid.drawPolygon(context, [point1, point2, point3], color);
        }

        private static drawPolygon(context: CanvasRenderingContext2D, polygon: Vector2D[], color: string) {
            let polygonLength = polygon.length;
            if (polygonLength < 2)
                return;
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(polygon[0].x, polygon[0].y);
            for (let index = 1; index < polygonLength; index++)
                context.lineTo(polygon[index].x, polygon[index].y);
            context.fill();
        }

        private static getRandomVector(): Vector2D {
            return new Vector2D(Boid.getRandomDistance(), Boid.getRandomDistance());       
        }

        private static getRandomDistance(): number {
            return Boid.maximumRandomDistance * (Math.random() + Math.random()) - Boid.maximumRandomDistance;
        }
    }

    export class Boids {
        static defaultInitialBoidCount     = 250;
        static defaultMaximumSpeed         =   8;
        static defaultCohesionParameter    = 100;
        static defaultSeparationParameter  =  10;
        static defaultAlignmentParameter   =   7;

        static initialBoidCount    = Boids.defaultInitialBoidCount   ;
        static maximumSpeed        = Boids.defaultMaximumSpeed       ;
        static cohesionParameter   = Boids.defaultCohesionParameter  ;
        static separationParameter = Boids.defaultSeparationParameter;
        static alignmentParameter  = Boids.defaultAlignmentParameter ;

        boids: Boid[] = [];

        append(boid: Boid): void {
            this.boids.push(boid);
        }

        move(size: Vector2D): void {
            let sum = this.getSum();
            let boidCount = this.boids.length;

            for (let index = 0; index < boidCount; index++) {
                let boid = this.boids[index];
                let speed = boid.speed;

                this.cohesion(sum.position, boid);
                this.separation(index);
                this.alignment(sum.velocity, boid);

                if (speed >= Boids.maximumSpeed)
                    boid.velocity = boid.velocity.multiply(Boids.maximumSpeed / speed);

                if (boid.position.x < 0 && boid.velocity.x < 0 || boid.position.x > size.x && boid.velocity.x > 0)
                    boid.velocity.x *= -1;
                if (boid.position.y < 0 && boid.velocity.y < 0 || boid.position.y > size.y && boid.velocity.y > 0)
                    boid.velocity.y *= -1;

                    boid.move();
            }
        }

        private getSum() : Boid {
            let sum = new Boid();
            let boidCount = this.boids.length;
            for (let index = 0; index < boidCount; index++) {
                sum.position.plusEqual(this.boids[index].position);
                sum.velocity.plusEqual(this.boids[index].velocity);
            }
            return sum;
        }

        private cohesion(sum: Vector2D, boid: Boid): void {
            let center = sum.clone();
            center.minusEqual(boid.position);
            center.divideByEqual(this.boids.length - 1);
            boid.velocity.plusEqual(center.minus(boid.position).divideBy(Boids.cohesionParameter));
        }

        private separation(index: number): void {
            for (let i = 0, length = this.boids.length; i < length; i++) {
                if (i === index)
                    continue;
                if (this.boids[i].getDistance(this.boids[index]) < Boids.separationParameter)
                    this.boids[index].velocity.minusEqual(this.boids[i].position.minus(this.boids[index].position));
            }
        }

        private alignment(sum: Vector2D, boid: Boid): void {
            let average = sum.clone();
            average.minusEqual(boid.velocity);
            average.divideByEqual(this.boids.length - 1);
            boid.velocity.plusEqual(average.minus(boid.velocity).divideBy(Boids.alignmentParameter));
        }
    }
}

namespace Shos.Boids.Application2D {
    import Vector2D = Shos.Boids.Core2D.Helper.Vector2D;
    import Boids = Shos.Boids.Core2D.Boids;
    import Boid = Shos.Boids.Core2D.Boid;

    class View {
        onMouseDown: (clickedPosition: Vector2D) => void = (clickedPosition: Vector2D) => {};
        onMouseUp  : () => void = () => {};

        private static sizeRate   = 0.95;
        private static heightRate = 0.6180339887498948;
        private context        : CanvasRenderingContext2D;
        canvas                 : HTMLCanvasElement;
        size                      = new Vector2D();

        constructor() {
            this.canvas = <HTMLCanvasElement>document.querySelector("#canvas");
            this.context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
            this.bindEvents();
        }

        update(): void {
            this.size.x = this.canvas.width  = Math.round(window.innerWidth * View.sizeRate);
            let screenHeight = View.getScreenHeight();
            this.size.y = this.canvas.height = Math.round(Math.max(this.size.x * View.heightRate, screenHeight * View.sizeRate));
            if (this.size.y > screenHeight)
                window.resizeBy(0, this.size.y - screenHeight);
        }

        drawBoids(boids: Boids): void {
            this.drawAllBoid(boids.boids);
        }

        private bindEvents(): void {
            this.canvas.addEventListener("mousedown" , e  => this.onMouseDown(View.getMousePosition(this.canvas, e)));
            this.canvas.addEventListener("touchstart", e  => this.onMouseDown(View.getTouchPosition(this.canvas, e)));
            this.canvas.addEventListener("mouseup"   , () => this.onMouseUp());
            this.canvas.addEventListener("touchend"  , () => this.onMouseUp());
        }

        private static getScreenHeight(): number {
            let header = <HTMLDivElement>document.getElementById("header");
            let footer = <HTMLDivElement>document.getElementById("footer");
            return window.innerHeight - (header == null ? 0 : header.clientHeight) - (footer == null ? 0 : footer.clientHeight);
        }

        private static getMousePosition(element: HTMLElement, e: MouseEvent): Vector2D {
            let rect = element.getBoundingClientRect();
            return new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
        }

        private static getTouchPosition(element: HTMLElement, e: TouchEvent): Vector2D {
            let rect = element.getBoundingClientRect();
            let touch = e.changedTouches[0];
            return new Vector2D(touch.clientX - rect.left, touch.clientY - rect.top);
        }

        private drawAllBoid(boids: Boid[]): void {
            this.context.clearRect(0, 0, this.size.x, this.size.y);

            for (let index = 0, length = boids.length; index < length; index++)
                boids[index].draw(this.context);
            this.drawCount(boids.length);
        }

        private drawCount(count: number): void {
            this.context.fillStyle = "gray";
            this.context.font = "14px";
            this.context.fillText("Boids: " + String(count), 20, 20);
        }
    }

    class Settings {
        private static key = "ShoBoids";

        static get() : any {
            return  {
                boidSize           : Boid .size                 ,
                randomParameter    : Boid .maximumRandomDistance,
                initialBoidCount   : Boids.initialBoidCount     ,
                maximumSpeed       : Boids.maximumSpeed         ,
                cohesionParameter  : Boids.cohesionParameter    ,
                separationParameter: Boids.separationParameter  ,
                alignmentParameter : Boids.alignmentParameter
            };
        }

        static set(boidSize: number, randomParameter: number, initialBoidCount: number, maximumSpeed: number, cohesionParameter: number, separationParameter: number, alignmentParameter: number) : void {
            Boid .size                  = boidSize           ;
            Boid .maximumRandomDistance = randomParameter    ;
            Boids.initialBoidCount      = initialBoidCount   ;
            Boids.maximumSpeed          = maximumSpeed       ;
            Boids.cohesionParameter     = cohesionParameter  ;
            Boids.separationParameter   = separationParameter;
            Boids.alignmentParameter    = alignmentParameter ;
        }

        static reset(): void {
            Boid .size                  = Boid .defaultSize                 ;
            Boid .maximumRandomDistance = Boid .defaultMaximumRandomDistance;
            Boids.initialBoidCount      = Boids.defaultInitialBoidCount     ;
            Boids.maximumSpeed          = Boids.defaultMaximumSpeed         ;
            Boids.cohesionParameter     = Boids.defaultCohesionParameter    ;
            Boids.separationParameter   = Boids.defaultSeparationParameter  ;
            Boids.alignmentParameter    = Boids.defaultAlignmentParameter   ;
        }

        static save(): boolean {
            if (!window.localStorage)
                return false;
            window.localStorage.setItem(Settings.key, JSON.stringify(Settings.get()));
            return true;
        }

        static load(): boolean {
            if (!window.localStorage)
                return false;
            let jsonText = window.localStorage.getItem(Settings.key);
            if (jsonText == null)
                return false;
            let data = JSON.parse(jsonText);
            if (data == null)
                return false;
            Settings.set(data.boidSize, data.randomParameter, data.initialBoidCount, data.maximumSpeed, data.cohesionParameter, data.separationParameter, data.alignmentParameter);
            return true;
        }
    }

    class SettingsPanel {
        static initialize(): void {
            SettingsPanel.initializeHandlers();
            SettingsPanel.initializeForm();
        }

        private static initializeHandlers(): void {
            (<HTMLInputElement>document.getElementById("submitButton")).onclick = SettingsPanel.onFormSubmit;
            (<HTMLInputElement>document.getElementById("reloadButton")).onclick = SettingsPanel.onReload    ;
            (<HTMLInputElement>document.getElementById("resetButton" )).onclick = SettingsPanel.onReset     ;

            SettingsPanel.enableEnterKey("boidSizeTextBox"           );
            SettingsPanel.enableEnterKey("randomParameterTextBox"    );
            SettingsPanel.enableEnterKey("initialBoidCountTextBox"   );
            SettingsPanel.enableEnterKey("maximumSpeedTextBox"       );
            SettingsPanel.enableEnterKey("cohesionParameterTextBox"  );
            SettingsPanel.enableEnterKey("separationParameterTextBox");
            SettingsPanel.enableEnterKey("alignmentParameterTextBox" );
        }

        private static onFormSubmit(): void {
            SettingsPanel.setSettingsFromForm();
            SettingsPanel.initializeForm();
        }

        private static onReload(): void {
            SettingsPanel.setSettingsFromForm();
            window.location.reload(false);
        }

        private static setSettingsFromForm(): void {
            let settingForm = (<any>document).settingForm;
            Settings.set(
                Number(settingForm.boidSizeTextBox           .value),
                Number(settingForm.randomParameterTextBox    .value),
                Number(settingForm.initialBoidCountTextBox   .value),
                Number(settingForm.maximumSpeedTextBox       .value),
                Number(settingForm.cohesionParameterTextBox  .value),
                Number(settingForm.separationParameterTextBox.value),
                Number(settingForm.alignmentParameterTextBox .value)
            );
            Settings.save();
        }

        private static onReset(): void {
            Settings.reset();
            Settings.save();
            SettingsPanel.initializeForm();
        }

        private static initializeForm(): void {
            let settings = Settings.get();
            SettingsPanel.setToInput("boidSizeTextBox"           , settings.boidSize           );
            SettingsPanel.setToInput("randomParameterTextBox"    , settings.randomParameter    );
            SettingsPanel.setToInput("initialBoidCountTextBox"   , settings.initialBoidCount   );
            SettingsPanel.setToInput("maximumSpeedTextBox"       , settings.maximumSpeed       );
            SettingsPanel.setToInput("cohesionParameterTextBox"  , settings.cohesionParameter  );
            SettingsPanel.setToInput("separationParameterTextBox", settings.separationParameter);
            SettingsPanel.setToInput("alignmentParameterTextBox" , settings.alignmentParameter );
        }

        private static setToInput(inputName: string, value: number): void {
            let elements = document.getElementsByName(inputName);
            if (elements.length > 0)
                (<HTMLInputElement>(elements[0])).value = String(value);
        }

        private static enableEnterKey(inputName: string): void {
            let elements = document.getElementsByName(inputName);
            if (elements.length > 0)
                elements[0].addEventListener("keypress", SettingsPanel.onKeyPress);
        }

        private static onKeyPress() {
            if (window.event != null && (<any>window.event).keyCode == 13)
                SettingsPanel.onFormSubmit();
        }
    }

    class Program {
        private static createTime       =  15;
        private static startTime        = 300;
        private static colorValueBase   = 0xa0; // 0x00~0xff
        private static opacityBase1     = 0.40; // 0.0~opacityBase2
        private static opacityBase2     = 0.60; // opacityBase1~1.0

        private boids: Boids;
        private view : View ;
        private appendTimer: number = 0;

        constructor() {
            Settings.load();
            this.boids = new Boids();
            this.view  = new View ();
            setTimeout(() => this.initialize(), Program.startTime);
        }

        private initialize(): void {
            this.bindEvents();
            this.view.update();
            this.appendBoids(Boids.initialBoidCount);
            setTimeout(() => this.step(), Program.startTime);
            SettingsPanel.initialize();
        }

        private bindEvents(): void {
            this.view.onMouseDown = position => this.appendBoids(1, position);
            this.view.onMouseUp   = ()       => clearInterval(this.appendTimer);
            window.addEventListener("resize", () =>  this.view.update());
        }

        private appendBoids(count: number, position?: Vector2D): void {
            let index = 0;
            this.appendTimer = setInterval(() => {
                if (count > 0 && index >= count) {
                    clearInterval(this.appendTimer);
                    return;
                }
                this.boids.append(Program.createBoid(this.view.size, position));
                index++;
            }, Program.createTime);
        }

        private static createBoid(areaSize: Vector2D ,position?: Vector2D) {
            return new Boid(position || areaSize.innerProduct(new Vector2D(Math.random(), Math.random())), new Vector2D(), this.getRandomColor());
        }

        private static getRandomColor(): string {
            return "rgba(" + String(Program.getRandomColorValue()) + ", " + String(Program.getRandomColorValue()) + ", " + String(Program.getRandomColorValue()) + ", " + String(Program.getOpactiy()) + ")";
        }

        private static getRandomColorValue(): number {
            return Math.round(Math.random() * Program.colorValueBase);
        }

        private static getOpactiy(): number {
            return Math.round(Math.random() * (Program.opacityBase2 - Program.opacityBase1) + Program.opacityBase1);
        }

        private step(): void {
            this.view.drawBoids(this.boids);
            this.boids.move(this.view.size);
            requestAnimationFrame(() => this.step());
        }
    }

    onload = () => new Program();
}
