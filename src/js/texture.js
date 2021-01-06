export default class Texture {
    constructor(data) {
        this.data = data;
    }

    sample(u, v) {
        return this.data[(v << 9) + u | 0];
    }

    static create(image) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return new Texture(new Uint32Array(context.getImageData(0, 0, image.width, image.height).data.buffer));
    }
}

export const EMPTY_TEXTURE = new Texture(new Uint32Array(512 * 512));
