import {IObserve} from 'be-observant/types'; 
export interface BeReformableVirtualProps{
    baseLink: string,
    path: string | string[],
    autoSubmit: boolean,
    url: string | IObserve,
    urlVal: string,
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
    onUrl(self: this): void;
    doFetch(self: this): void;
    sendFetchResultToTarget(self: this): void;
    finale(proxy: HTMLFormElement & BeReformableVirtualProps): void;
}