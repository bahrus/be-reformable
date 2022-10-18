import {IObserve} from 'be-observant/types'; 
import {MinimalProxy} from 'be-decorated/types';

export interface EndUserProps{
    baseLink?: string,
    /** This part of the url derives from the form elements */
    path?: string[] | boolean,
    autoSubmit?: boolean,
    autoSubmitOn?: string | string[],
    /**
     * This part of the url can come from external binding, like from the host
     */
    url?: string | string[] | IObserve,
    
    init?: string | IObserve,
    
    /**
     * dot delimited path to a sub object in the fetch result
     */
    fetchResultPath?: string[],

    /** Set host's property with specified propKey to result of fetch */
    propKey?: string,

    initVal?: RequestInit,

    fetchInProgress?: boolean;

    fetchInProgressCssClass?: string;

    urlVal?: string,


    transformPlugins?: {[key: string]: boolean};

    dispatchFromTarget?: string;

    transform?: any;

    filterOutDefaultValues?: any;

    headers?: boolean;

    bodyName?: string;

    debounceDuration?: number;

}
export interface VirtualProps extends EndUserProps, MinimalProxy<HTMLFormElement>{
    fetchResult?: any,
    beOosoom: string,
    isVisible: boolean,
    fetchCount: number,
    fetchCountEcho: number,
}

export type Proxy = HTMLFormElement & VirtualProps;

export interface ProxyProps extends VirtualProps {
    proxy: Proxy;
}

export type PP = ProxyProps

export interface Actions{
    //intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement): void;
    onAutoSubmit(pp: PP): void;
    onUrl(pp: PP): void;
    onInit(pp: PP): void;
    doQueueFetch(pp: PP): void;
    doFetch(pp: PP): void;
    sendFetchResultToTarget(pp: PP): void;
    finale(proxy: Proxy): void;
    onNotAutoSubmit(pp: PP): void;
}