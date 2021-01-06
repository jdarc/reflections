import Gradients from "./gradients";
import Edge from "./edge";
import { EMPTY_TEXTURE } from "./texture";

const SPECULAR_MAP = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7,
    7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 13, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 29, 30, 31, 33, 34, 36, 37, 39, 41, 43, 44, 46, 48,
    51, 53, 55, 57, 60, 62, 65, 68, 70, 73, 76, 80, 83, 86, 90, 93, 97, 101, 105,
    109, 114, 118, 123, 127, 132, 137, 143, 148, 154, 160, 166, 172, 178, 185,
    192, 199, 206, 214, 222, 230, 238, 247, 255]);

export default class Surface {
    constructor(canvas) {
        this.context = canvas.getContext("2d");
        this.imageData = this.context.createImageData(canvas.width, canvas.height);
        this.colorBuffer = new Uint8ClampedArray(this.imageData.data.buffer);
        this.depthBuffer = new Float32Array(canvas.width * canvas.height);
        this.gradients = new Gradients();
        this.edges = [new Edge(), new Edge(), new Edge()];
        this.width = canvas.width;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.texture = EMPTY_TEXTURE;
    }

    clear() {
        this.colorBuffer.fill(0);
        this.depthBuffer.fill(Infinity);
    };

    update() {
        this.context.putImageData(this.imageData, 0.0, 0.0);
    };

    render(v0, v1, v2) {
        if (Surface.isBackFacing(v0, v1, v2)) return
        this.gradients.configure(v0, v1, v2)

        let leftIndex;
        if (v0.position.y < v1.position.y) {
            if (v2.position.y < v0.position.y) {
                this.edges[0].configure(v2, v1, this.gradients, 8);
                this.edges[1].configure(v2, v0, this.gradients, 8);
                this.edges[2].configure(v0, v1, this.gradients, 0);
                leftIndex = 0;
            } else {
                if (v1.position.y < v2.position.y) {
                    this.edges[0].configure(v0, v2, this.gradients, 0);
                    this.edges[1].configure(v0, v1, this.gradients, 0);
                    this.edges[2].configure(v1, v2, this.gradients, 4);
                    leftIndex = 0;
                } else {
                    this.edges[0].configure(v0, v1, this.gradients, 0);
                    this.edges[1].configure(v0, v2, this.gradients, 0);
                    this.edges[2].configure(v2, v1, this.gradients, 8);
                    leftIndex = 1;
                }
            }
        } else if (v2.position.y < v1.position.y) {
            this.edges[0].configure(v2, v0, this.gradients, 8);
            this.edges[1].configure(v2, v1, this.gradients, 8);
            this.edges[2].configure(v1, v0, this.gradients, 4);
            leftIndex = 1;
        } else {
            if (v0.position.y < v2.position.y) {
                this.edges[0].configure(v1, v2, this.gradients, 4);
                this.edges[1].configure(v1, v0, this.gradients, 4);
                this.edges[2].configure(v0, v2, this.gradients, 0);
                leftIndex = 1;
            } else {
                this.edges[0].configure(v1, v0, this.gradients, 4);
                this.edges[1].configure(v1, v2, this.gradients, 4);
                this.edges[2].configure(v2, v0, this.gradients, 8);
                leftIndex = 0;
            }
        }

        let rightIndex = 1 - leftIndex;
        let height = this.edges[1].height;
        let total = this.edges[0].height;
        let y = this.edges[0].y * this.width;
        while (total > 0) {
            total = total - height;
            const left = this.edges[leftIndex];
            const right = this.edges[rightIndex];
            while (height-- > 0) {
                const xStart = ~~Math.ceil(left.x);
                let scan = ~~Math.ceil(right.x) - xStart;
                const xPreStep = xStart - left.x;
                let uOverZ = left.overZ[0] + xPreStep * this.gradients.dxdu;
                let vOVerZ = left.overZ[1] + xPreStep * this.gradients.dxdv;
                let sOverZ = left.overZ[2] + xPreStep * this.gradients.dxds;
                let oOverZ = left.overZ[3] + xPreStep * this.gradients.dxd1;
                let mem = y + xStart | 0;
                while (scan-- > 0) {
                    const z = 1.0 / oOverZ;
                    if (z < this.depthBuffer[mem]) {
                        this.depthBuffer[mem] = z;
                        const u = ~~(uOverZ * z * 256) + 256;
                        const v = ~~(vOVerZ * z * 256) + 256;
                        const s = ~~(sOverZ * z * 220) + 35;
                        const env = this.texture.sample(u, v);
                        const spec = SPECULAR_MAP[s];
                        this.colorBuffer[mem * 4 + 0] = spec + (s * (env >>> 0x00 & 255) >>> 8);
                        this.colorBuffer[mem * 4 + 1] = spec + (s * (env >>> 0x08 & 255) >>> 8);
                        this.colorBuffer[mem * 4 + 2] = spec + (s * (env >>> 0x10 & 255) >>> 8);
                        this.colorBuffer[mem * 4 + 3] = 255;
                    }
                    uOverZ = uOverZ + this.gradients.dxdu;
                    vOVerZ = vOVerZ + this.gradients.dxdv;
                    sOverZ = sOverZ + this.gradients.dxds;
                    oOverZ = oOverZ + this.gradients.dxd1;
                    ++mem;
                }
                left.step();
                right.step();
                y = y + this.width;
            }
            height = this.edges[2].height;
            leftIndex = leftIndex << 1;
            rightIndex = rightIndex << 1;
        }
    }

    static isBackFacing(a, b, c) {
        return (b.position.x - a.position.x) * (c.position.y - a.position.y) -
               (c.position.x - a.position.x) * (b.position.y - a.position.y) < 0;
    }
}
