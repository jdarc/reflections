export default class Vector3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static dot(lhs, rhs) {
        return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
    }

    static normalize(src) {
        const s = 1.0 / Math.sqrt(src.x * src.x + src.y * src.y + src.z * src.z);
        return new Vector3(src.x * s, src.y * s, src.z * s);
    }
}
