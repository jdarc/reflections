export default class Gradients {
    constructor() {
        this.dxdu = 0;
        this.dydu = 0;
        this.dxdv = 0;
        this.dydv = 0;
        this.dxds = 0;
        this.dyds = 0;
        this.dxd1 = 0;
        this.dyd1 = 0;
        this.overZ = new Float32Array(12);
    }

    configure(v0, v1, v2) {
        this.overZ[3] = 1 / v0.position.z;
        this.overZ[0] = v0.normal.x * this.overZ[3];
        this.overZ[1] = v0.normal.y * this.overZ[3];
        this.overZ[2] = v0.normal.z * this.overZ[3];
        this.overZ[7] = 1 / v1.position.z;
        this.overZ[4] = v1.normal.x * this.overZ[7];
        this.overZ[5] = v1.normal.y * this.overZ[7];
        this.overZ[6] = v1.normal.z * this.overZ[7];
        this.overZ[11] = 1 / v2.position.z;
        this.overZ[8] = v2.normal.x * this.overZ[11];
        this.overZ[9] = v2.normal.y * this.overZ[11];
        this.overZ[10] = v2.normal.z * this.overZ[11];
        const v0x2x = v0.position.x - v2.position.x;
        const v1x2x = v1.position.x - v2.position.x;
        const v0y2y = v0.position.y - v2.position.y;
        const v1y2y = v1.position.y - v2.position.y;
        const oneOverDx = 1 / (v1x2x * v0y2y - v0x2x * v1y2y);
        const tx0 = oneOverDx * v0y2y;
        const tx1 = oneOverDx * v1y2y;
        const ty0 = oneOverDx * v0x2x;
        const ty1 = oneOverDx * v1x2x;
        this.dxdu = (this.overZ[4] - this.overZ[8]) * tx0 - (this.overZ[0] - this.overZ[8]) * tx1;
        this.dydu = (this.overZ[8] - this.overZ[4]) * ty0 - (this.overZ[8] - this.overZ[0]) * ty1;
        this.dxdv = (this.overZ[5] - this.overZ[9]) * tx0 - (this.overZ[1] - this.overZ[9]) * tx1;
        this.dydv = (this.overZ[9] - this.overZ[5]) * ty0 - (this.overZ[9] - this.overZ[1]) * ty1;
        this.dxds = (this.overZ[6] - this.overZ[10]) * tx0 - (this.overZ[2] - this.overZ[10]) * tx1;
        this.dyds = (this.overZ[10] - this.overZ[6]) * ty0 - (this.overZ[10] - this.overZ[2]) * ty1;
        this.dxd1 = (this.overZ[7] - this.overZ[11]) * tx0 - (this.overZ[3] - this.overZ[11]) * tx1;
        this.dyd1 = (this.overZ[3] - this.overZ[11]) * ty1 - (this.overZ[7] - this.overZ[11]) * ty0;
    }
}
