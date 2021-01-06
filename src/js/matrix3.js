import Vector3 from "./vector3";

export default class Matrix3 {
    constructor(e00, e01, e02, e10, e11, e12, e20, e21, e22) {
        this.e00 = e00;
        this.e01 = e01;
        this.e02 = e02;
        this.e10 = e10;
        this.e11 = e11;
        this.e12 = e12;
        this.e20 = e20;
        this.e21 = e21;
        this.e22 = e22;
    }

    times(m) {
        return new Matrix3(
            this.e00 * m.e00 + this.e01 * m.e10 + this.e02 * m.e20,
            this.e00 * m.e01 + this.e01 * m.e11 + this.e02 * m.e21,
            this.e00 * m.e02 + this.e01 * m.e12 + this.e02 * m.e22,
            this.e10 * m.e00 + this.e11 * m.e10 + this.e12 * m.e20,
            this.e10 * m.e01 + this.e11 * m.e11 + this.e12 * m.e21,
            this.e10 * m.e02 + this.e11 * m.e12 + this.e12 * m.e22,
            this.e20 * m.e00 + this.e21 * m.e10 + this.e22 * m.e20,
            this.e20 * m.e01 + this.e21 * m.e11 + this.e22 * m.e21,
            this.e20 * m.e02 + this.e21 * m.e12 + this.e22 * m.e22
        );
    }

    static transform(src, matrix, dst = new Vector3()) {
        dst.x = src.x * matrix.e00 + src.y * matrix.e10 + src.z * matrix.e20;
        dst.y = src.x * matrix.e01 + src.y * matrix.e11 + src.z * matrix.e21;
        dst.z = src.x * matrix.e02 + src.y * matrix.e12 + src.z * matrix.e22;
        return dst;
    }

    static rotationX(a) {
        return new Matrix3(1, 0, 0, 0, Math.cos(a), Math.sin(a), 0, -Math.sin(a), Math.cos(a));
    }

    static rotationY(a) {
        return new Matrix3(Math.cos(a), 0, -Math.sin(a), 0, 1, 0, Math.sin(a), 0, Math.cos(a));
    }
}
