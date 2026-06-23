(function ($) {
    THREE.ImageUtils.crossOrigin = '';
 
    this.Visualizador360 = function () {

        var defaults = {
            elementId: 'container',
            imageURL: '',
            height: 400,
            width: 600,
            initialLon: 180
        }

        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        } else throw new Error('Visualizador360 must have at least one argument containing a map of defaults parameters');

        this.domElement = document.getElementById(this.options.elementId);
        this.controlsElement = null;
        this.Width = this.options.width;
        this.Height = this.options.height;

        this.mesh = null;

        this.lon = this.options.initialLon;
        this.lat = 0;
    } 

    this.Visualizador360.isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

    Visualizador360.prototype.init = function () {

        var isUserInteracting = false, needsUpdate = true,
            lon = 180, lat = 0,
			phi = 0, theta = 0;

        var camera = new THREE.PerspectiveCamera(90, this.Width / this.Height, 1, 1100);
        camera.target = new THREE.Vector3(0, 0, 0);

        var scene = new THREE.Scene();

        var geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

        var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(this.options.imageURL)
        });

        this.mesh = new THREE.Mesh(geometry, material);

        scene.add(this.mesh);

        var renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.Width, this.Height);
        renderer.domElement.className = "pano_canvas unselectable";
        this.domElement.appendChild(renderer.domElement);
        
        var sliderBox = null;
        var minFov = 30;
        var maxFov = 110;

        function updateCameraFov(fov) {
            camera.fov = fov;
            camera.fov = Math.min(maxFov, Math.max(minFov, camera.fov));
            camera.updateProjectionMatrix();
            sliderBox.dispatchEvent(new CustomEvent("updateSlider", {}));
            markForUpdate();
        }

        // Criar controlos
        function createButton(class_name) {
            var div = document.createElement("div");
            div.className = "pano_nav_btn centered";
            var span = document.createElement("span");
            span.className = "pano_icon " + class_name;
            div.appendChild(span);
            return div;
        }

        function createSlider(class_name) {
            var div = document.createElement("div");
            div.className = class_name + " centered";
            var bar = document.createElement("div");
            bar.className = "pano_slider_bar";
            div.appendChild(bar);
            var box = document.createElement("div");
            sliderBox = box;
            box.className = "pano_slider_box";

            var mouseY, onGrabFov, grabbingBox;
            box.addEventListener("mousedown", function (event) {
                event.preventDefault();
                mouseY = event.clientY;
                onGrabFov = camera.fov;
                grabbingBox = true;
            });
            document.addEventListener("mousemove", function (event) {
                if (grabbingBox === true) {
                    updateCameraFov((event.clientY - mouseY) * 1 + onGrabFov);
                }
            });
            document.addEventListener("mouseup", function (event) {
                grabbingBox = false;
            });
            div.appendChild(box);
            return div;
        }

        if (Visualizador360.isMobile !== true) {
            var controlsElement = document.createElement("div");
            controlsElement.className = "pano_nav";

            var controlsZoom = document.createElement("div");
            controlsZoom.className = "pano_nav_zoom";
            {
                var controlsZoomPlus = createButton("pano_plus");
                controlsZoomPlus.addEventListener("click", function () {
                    updateCameraFov(camera.fov - 20);
                });
                controlsZoom.appendChild(controlsZoomPlus);

                var controlsZoomSlider = createSlider("pano_slider");
                sliderBox.addEventListener("updateSlider", function () {
                    var percent = (camera.fov - minFov) * (100 / (maxFov - minFov));
                    sliderBox.style.top = percent + "%";
                });
                sliderBox.style.top = (90 - minFov) * (100 / (maxFov - minFov)) + "%";
                controlsZoom.appendChild(controlsZoomSlider);

                var controlsZoomMinus = createButton("pano_minus");
                controlsZoomMinus.addEventListener("click", function () {
                    updateCameraFov(camera.fov + 20);
                });
                controlsZoom.appendChild(controlsZoomMinus);
            }
            controlsElement.appendChild(controlsZoom);

            this.domElement.appendChild(controlsElement);
        }

        TouchMouseEvent = {
            DOWN: "touchmousedown",
            MOVE: "touchmousemove",
            UP: "touchmouseup"
        }

        var normalizeEvent = function (type, original, x, y) {
            return $.Event(type, {
                pageX: x,
                pageY: y,
                originalEvent: original
            });
        }

        var onMouseEvent = function (event) {
            var type;

            switch (event.type) {
                case "mousedown": type = TouchMouseEvent.DOWN; break;
                case "mouseup": type = TouchMouseEvent.UP; break;
                case "mousemove": type = TouchMouseEvent.MOVE; break;
                default: return;
            }

            var touchMouseEvent = normalizeEvent(type, event, event.pageX, event.pageY);
            $(event.target).trigger(touchMouseEvent);
        }

        var onTouchEvent = function (event) {
            if (event.originalEvent.touches.length > 1) {
                return;
            }

            var type;

            switch (event.type) {
                case "touchstart": type = TouchMouseEvent.DOWN; break;
                case "touchend": type = TouchMouseEvent.UP; break;
                case "touchmove": type = TouchMouseEvent.MOVE; break;
                default: return;
            }

            var touch = event.originalEvent.touches[0];
            var touchMouseEvent;

            if (type == TouchMouseEvent.UP)
                touchMouseEvent = normalizeEvent(type, event, null, null);
            else
                touchMouseEvent = normalizeEvent(type, event, touch.pageX, touch.pageY);

            $(event.target).trigger(touchMouseEvent);
        }

        if ("ontouchstart" in window) {
            var jQueryElement = $(renderer.domElement);
            var jQueryDocument = $(document);

            jQueryElement.on("touchstart", onTouchEvent);
            jQueryDocument.on("touchmove", onTouchEvent);
            jQueryDocument.on("touchend", onTouchEvent);

            jQueryElement.on(TouchMouseEvent.DOWN, handleStart);
            jQueryDocument.on(TouchMouseEvent.MOVE, handleMove);
            jQueryDocument.on(TouchMouseEvent.UP, handleEnd);
            jQueryElement.on("gesturechange", onPinch);
            jQueryElement.on("gesturestart", onPinchStart);
        }

        if ("onmousedown" in window) {
            var jQueryElement = $(renderer.domElement);
            var jQueryDocument = $(document);

            jQueryElement.on("mousedown", onMouseEvent);
            jQueryDocument.on("mousemove", onMouseEvent);
            jQueryDocument.on("mouseup", onMouseEvent);

            jQueryElement.on(TouchMouseEvent.DOWN, handleStart);
            jQueryDocument.on(TouchMouseEvent.MOVE, handleMove);
            jQueryDocument.on(TouchMouseEvent.UP, handleEnd);
            jQueryElement.on('mousewheel', onDocumentMouseWheel);
            jQueryElement.on('DOMMouseScroll', onDocumentMouseWheel);
        }

        // o próprio visualizador
        var vis = this;

        var onHandleStartPageX = 0, onHandleStartPageY = 0,
            onHandleStartLon = 0, onHandleStartLat = 0;


        function handleStart(event) {
            event.preventDefault();

            isUserInteracting = true;

            onHandleStartPageX = event.pageX;
            onHandleStartPageY = event.pageY;

            onHandleStartLon = vis.lon;
            onHandleStartLat = vis.lat;
        }

        function handleEnd(event) {
            event.preventDefault();

            isUserInteracting = false;
        }

        function handleMove(event) {
            event.preventDefault();

            if (isUserInteracting === true) {
                vis.lon = (onHandleStartPageX - event.pageX) * 0.2 + onHandleStartLon;
                vis.lat = (event.pageY - onHandleStartPageY) * 0.2 + onHandleStartLat;
                markForUpdate();
            }
        }

        function onDocumentMouseWheel(event) {
            
            event.preventDefault();

            var fov = camera.fov;
            // WebKit
            if (event.originalEvent.wheelDeltaY) {

                fov -= event.originalEvent.wheelDeltaY * 0.05;

            // Opera / Explorer 9
            } else if (event.originalEvent.wheelDelta) {

                fov -= event.originalEvent.wheelDelta * 0.05;

            // Firefox
            } else if (event.originalEvent.detail) {

                fov += event.originalEvent.detail * 1.0;

            }

            updateCameraFov(fov);

        }

        var lastScale;

        function onPinchStart(event) {
            event.preventDefault();
            lastScale = 1;
        }

        function onPinch(event) {
            event.preventDefault();

            var scale = event.originalEvent.scale;
            var scaleDiff = lastScale - scale;

            updateCameraFov(camera.fov + (scaleDiff * 30));

            lastScale = scale;
            /*
            $("#gestureDiv").css("width", 50 + 30 * scaleDiff);
            $("#gestureDiv").css("height", 50 + 30 * scaleDiff);*/
        }

        function markForUpdate() {

            needsUpdate = true;
            //requestAnimationFrame(animate);

        }

        function update() {

            vis.lat = Math.max(-85, Math.min(85, vis.lat));
            phi = THREE.Math.degToRad(90 - vis.lat);
            theta = THREE.Math.degToRad(vis.lon);

            camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
            camera.target.y = 500 * Math.cos(phi);
            camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

            camera.lookAt(camera.target);

            renderer.render(scene, camera);

            needsUpdate = false;

        }

        function animate() {

            // TODO o ideal era por isto a desenhar apenas quando precisa para
            // consumir menos recursos, principalmente em dispositivos mobile
            // infelizmente no chrome as primeiras frames não estão a ser desenhadas
            if (needsUpdate || true) {
                update();
                requestAnimationFrame(animate);
            }

        }

        animate();
        //markForUpdate();
    }

    Visualizador360.prototype.setImage = function (imageURL, initialLon) {
        this.lon = initialLon || 180;
        this.lat = 0;
        this.options.imageURL = imageURL;

        THREE.ImageUtils.crossOrigin = '';

        //var texture = THREE.ImageUtils.loadTexture(imageURL);
        this.mesh.material = material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imageURL)
        });
    }

    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

}(jQuery));