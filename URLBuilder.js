export class URLBuilder {
    pattern;
    #tokens = [];
    get tokens() {
        return this.#tokens;
    }
    constructor(pattern) {
        this.pattern = pattern;
        let result;
        let i = 0;
        const positions = this.#tokens;
        while ((result = reg.exec(pattern)) !== null) {
            const beforeToken = pattern.substring(i, result.index);
            const r = result[0];
            const tokenKey = r.substring(1);
            i = result.index + r.length;
            positions.push([beforeToken, tokenKey]);
        }
        if (i < pattern.length) {
            positions.push([pattern.substring(i), undefined]);
        }
    }
    build(obj) {
        const tokens = [];
        for (const tokenItem of this.#tokens) {
            const [beforeToken, key] = tokenItem;
            tokens.push(beforeToken);
            if (key !== undefined && key in obj) {
                tokens.push(obj[key]);
            }
        }
        return tokens.join('');
    }
}
const reg = /\:\w+/g;
