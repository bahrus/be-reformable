import {IObserve} from 'be-observant/types'; 
export interface BeReformableVirtualProps{
    baseLink?: string,
    /** This part of the url derives from the form elements */
    path?: string | string[],
    autoSubmit?: boolean,
    /**
     * This part of the url can come from external binding, like from the host
     */
    url?: string | string[] | IObserve,
    urlVal?: string,
    init?: RequestInit,
    propKey?: string,
    as?: 'text' | 'json',
    fetchResult?: any,
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