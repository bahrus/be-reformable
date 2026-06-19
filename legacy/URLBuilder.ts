import { BeforeToken, TokenKey, IURLBuilder } from './ts-refs/be-reformable/types';
export class URLBuilder implements IURLBuilder{
    #tokens: Array<[BeforeToken, TokenKey]> = [];
    get tokens(){
        return this.#tokens;
    }
    constructor(public pattern: string){
        let result;
        let i = 0;
        const positions = this.#tokens;
        while ((result = reg.exec(pattern)) !== null) {
            const beforeToken = pattern.substring(i, result.index);
            const r = result[0]
            const tokenKey = r.substring(1);
            i = result.index + r.length;
            positions.push([beforeToken, tokenKey]);
        }
        if(i < pattern.length){
            positions.push([pattern.substring(i), undefined]);
        }
    }

    build(obj: any){
        const tokens: Array<string> = [];
        for(const tokenItem of this.#tokens){
            const [beforeToken, key] = tokenItem;
            tokens.push(beforeToken);
            if(key !== undefined && key in obj){
                tokens.push(obj[key]);
            }
        }
        return tokens.join('');
    }
}

const reg = /\:\w+/g;
