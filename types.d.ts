import {IObserve} from 'be-observant/types'; 

export interface BeReformableEndUserProps{
    baseLink?: string,
    /** This part of the url derives from the form elements */
    path?: string | string[],
    autoSubmit?: boolean,
    autoSubmitOn?: string | string[],
    /**
     * This part of the url can come from external binding, like from the host
     */
    url?: string | string[] | IObserve,
    
    init?: string | IObserve,
    
    as?: 'text' | 'json',
    /**
     * dot delimited path to a sub object in the fetch result
     */
    fetchResultPath?: string[],

    /** Set host's property with specified propKey to result of fetch */
    propKey?: string,

    initVal?: RequestInit,

    urlVal?: string,

    headerFormSelector?: string,
}
export interface BeReformableVirtualProps extends BeReformableEndUserProps{
    fetchResult?: any,
}
export interface BeReformableProps extends BeReformableVirtualProps{
    proxy: HTMLFormElement & BeReformableVirtualProps;
}

export interface BeReformableActions{
    //intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement): void;
    onAutoSubmit(self: this): void;
    onUrl(self: this): void;
    onInit(self: this): void;
    onHeaderFormSelector(self: this): void;
    doFetch(self: this): void;
    sendFetchResultToTarget(self: this): void;
    finale(proxy: HTMLFormElement & BeReformableVirtualProps): void;
}