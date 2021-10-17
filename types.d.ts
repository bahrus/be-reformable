
export interface BeReformableVirtualProps{
    baseLink: string,
    path: string | string[],
    autoSubmit: boolean
}
export interface BeReformableProps extends BeReformableVirtualProps{
    proxy: HTMLFormElement & BeReformableVirtualProps;
}

export interface BeReformableActions{
    //intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement): void;
    finale(proxy: HTMLFormElement & BeReformableVirtualProps): void;
    onAutoSubmit(self: this): void;
}