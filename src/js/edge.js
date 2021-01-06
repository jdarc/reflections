export default class Edge {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.height = 0;
        this.overZ = new Float32Array(4);
        this.xStep = 0;
        this.overZStep = new Float32Array(4);
    }

    configure(v0, v1, gradients, offset) {
        this.y = Math.ceil(v0.position.y);
        this.height = Math.ceil(v1.position.y) - this.y | 0;

        if (this.height > 0) {
            const yPreStep = this.y - v0.position.y;
            this.xStep = (v1.position.x - v0.position.x) / (v1.position.y - v0.position.y);
            this.x = yPreStep * this.xStep + v0.position.x;
            this.overZStep[0] = this.xStep * gradients.dxdu + gradients.dydu;
            this.overZStep[1] = this.xStep * gradients.dxdv + gradients.dydv;
            this.overZStep[2] = this.xStep * gradients.dxds + gradients.dyds;
            this.overZStep[3] = this.xStep * gradients.dxd1 + gradients.dyd1;
            const xPreStep = this.x - v0.position.x;
            this.overZ[0] = yPreStep * gradients.dydu + xPreStep * gradients.dxdu + gradients.overZ[offset + 0 | 0];
            this.overZ[1] = yPreStep * gradients.dydv + xPreStep * gradients.dxdv + gradients.overZ[offset + 1 | 0];
            this.overZ[2] = yPreStep * gradients.dyds + xPreStep * gradients.dxds + gradients.overZ[offset + 2 | 0];
            this.overZ[3] = yPreStep * gradients.dyd1 + xPreStep * gradients.dxd1 + gradients.overZ[offset + 3 | 0];
        }
    }

    step() {
        ++this.y;
        this.x += this.xStep;
        this.overZ[0] += this.overZStep[0];
        this.overZ[1] += this.overZStep[1];
        this.overZ[2] += this.overZStep[2];
        this.overZ[3] += this.overZStep[3];
    }
}
