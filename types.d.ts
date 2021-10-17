
export interface BeReformableVirtualProps{
    baseLink: string,
    path: string | string[],
    autoSubmit: boolean,
    url: string,
    reqInit: RequestInit,
    as: 'text' | 'json',
    fetchResult: any,
}
export interface BeReformableProps extends BeReformableVirtualProps{
    proxy: HTMLFormElement & BeReformableVirtualProps;
}

export interface BeReformableActions{
    //intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement): void;
    onAutoSubmit(self: this): void;
    doFetch(self: this): void;
    sendFetchResultToTarget(self: this): void;
    finale(proxy: HTMLFormElement & BeReformableVirtualProps): void;
}