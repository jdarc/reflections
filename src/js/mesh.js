import Vector3 from "./vector3";
import Vertex from "./vertex";

export default class Mesh {
    constructor(vertexBuffer) {
        this.vertexBuffer = vertexBuffer;
    }

    static load(directives) {
        const vertices = [];
        const normals = [];
        const buffer = [];
        const lines = directives.split("\n");
        lines.filter(line => line && line.trim().length > 0).forEach(line => {
            const fragments = line.toLowerCase().split(" ");
            if (fragments[0] === "v") {
                const x = parseFloat(fragments[1]);
                const y = parseFloat(fragments[2]);
                const z = parseFloat(fragments[3]);
                vertices.push(new Vector3(x, y, z));
            } else if (fragments[0] === "vn") {
                const x = parseFloat(fragments[1]);
                const y = parseFloat(fragments[2]);
                const z = parseFloat(fragments[3]);
                normals.push(new Vector3(x, y, z));
            } else if (fragments[0] === "f") {
                const f0 = fragments[1].split("//").map(v => parseInt(v.trim()) - 1);
                const f1 = fragments[2].split("//").map(v => parseInt(v.trim()) - 1);
                const f2 = fragments[3].split("//").map(v => parseInt(v.trim()) - 1);
                buffer.push(new Vertex(vertices[f0[0]], normals[f0[1]]));
                buffer.push(new Vertex(vertices[f1[0]], normals[f1[1]]));
                buffer.push(new Vertex(vertices[f2[0]], normals[f2[1]]));
            }
        });
        return new Mesh(buffer);
    }
}
