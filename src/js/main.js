import '../css/main.css';
import Vertex from "./vertex";
import Vector3 from "./vector3";
import Matrix3 from "./matrix3";
import Mesh from "./mesh";
import Texture from "./texture";
import Surface from "./surface";

const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;

window.addEventListener("load", () => {
    const options = document.createElement("div");
    options.classList.add("options");
    options.append(...(["Teapot", "Nut & Bolt", "Bart", "Ram", "Beethoven", "King Tut", "Buddha"].map(name => {
        const filename = name.toLowerCase().replace(/\s+|&/ig, "");
        const img = document.createElement("img");
        img.src = `images/${filename}.png`;
        img.alt = img.title = name;
        img.addEventListener("click", () => loadMesh(`${filename}.obj`));
        return img;
    })));
    document.body.prepend(options);

    const adjust = navigator.userAgent.search("Firefox") >= 0 ? 1 : 0;
    const canvas = document.createElement("canvas");
    canvas.classList.add("viewport");
    canvas.width = 1024 >> adjust;
    canvas.height = 1024 >> adjust;
    document.body.prepend(canvas);

    const graphics = new Surface(canvas);
    const light = Vector3.normalize(new Vector3(5, 30, -30));
    const dst0 = new Vertex(new Vector3(), new Vector3());
    const dst1 = new Vertex(new Vector3(), new Vector3());
    const dst2 = new Vertex(new Vector3(), new Vector3());
    let mesh = null;
    let dragging = false;
    let arcX = 0;
    let arcY = 0;
    let oldX = 0;
    let oldY = 0;

    function resizeView() {
        const scale = Math.min(document.body.offsetWidth / canvas.width, document.body.offsetHeight / canvas.height);
        canvas.style.transform = `translateY(-50%) translateX(-50%) scale(${scale}, ${scale})`;
    }

    function loadMesh(filename = "teapot.obj") {
        fetch(`data/${filename}`).then(response => response.text()).then(data => mesh = Mesh.load(data));
    }

    function transformLight(src, dst, world, normal) {
        Matrix3.transform(src.position, world, dst.position)
        Matrix3.transform(src.normal, normal, dst.normal)
        dst.position.z = dst.position.z + 2;
        dst.position.x = graphics.centerX + dst.position.x / dst.position.z;
        dst.position.y = graphics.centerY - dst.position.y / dst.position.z;
        dst.normal.z = clamp(Vector3.dot(dst.normal, light));
    }

    function renderFrame(timestamp) {
        window.requestAnimationFrame(renderFrame);
        graphics.clear();
        if (mesh != null) {
            if (!dragging) arcY = timestamp / 200;
            const scale = canvas.offsetWidth;
            const normal = Matrix3.rotationY(arcY).times(Matrix3.rotationX(arcX));
            const world = normal.times(new Matrix3(scale, 0, 0, 0, scale, 0, 0, 0, 1));
            for (let i = 0, len = mesh.vertexBuffer.length; i < len;) {
                transformLight(mesh.vertexBuffer[i++], dst0, world, normal);
                transformLight(mesh.vertexBuffer[i++], dst1, world, normal);
                transformLight(mesh.vertexBuffer[i++], dst2, world, normal);
                graphics.render(dst0, dst1, dst2);
            }
        }
        graphics.update();
    }

    window.addEventListener('mousedown', e => {
        if (e.button === 0) {
            oldX = e.clientX;
            oldY = e.clientY;
            dragging = true;
        }
    });

    window.addEventListener('mousemove', e => {
        if (dragging) {
            arcY -= (e.clientX - oldX) / 100;
            arcX -= (e.clientY - oldY) / 100;
            arcX = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, arcX));
            oldX = e.clientX;
            oldY = e.clientY;
        }
    });

    window.addEventListener('mouseup', () => dragging = false);

    window.addEventListener('touchstart', e => {
        if (e.changedTouches && e.changedTouches.length > 0) {
            oldX = e.changedTouches[0].pageX;
            oldY = e.changedTouches[0].pageY;
        }
        dragging = true;
    });

    window.addEventListener('touchmove', e => {
        if (dragging && e && e.changedTouches && e.changedTouches.length > 0) {
            arcY -= (e.changedTouches[0].pageX - oldX) / 100;
            arcX -= (e.changedTouches[0].pageY - oldY) / 100;
            arcX = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, arcX));
            oldX = e.changedTouches[0].pageX;
            oldY = e.changedTouches[0].pageY;
        }
    });

    window.addEventListener('touchend', () => dragging = false);

    window.addEventListener('resize', () => resizeView());

    const envImage = new Image();
    envImage.onload = () => graphics.texture = Texture.create(envImage);
    envImage.src = `images/environment.jpg`;

    resizeView() || loadMesh();

    window.requestAnimationFrame(renderFrame);
});
