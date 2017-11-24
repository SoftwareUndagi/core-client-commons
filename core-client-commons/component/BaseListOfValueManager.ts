import { CoreAjaxHelper , isNull } from '../utils/index' ; 
import { LOVEnabledComponent , ListOfValueManager , LoadLookupFromCacheDataWrapper , CachedLookupDefinition } from './ListOfValueManager'; 
import { CommonCommunicationData , LookupWithTokenResponse , LookupWithToken } from '../shared/index'; 
/**
 * lookup value manager
 */
export abstract class BaseListOfValueManager implements ListOfValueManager{
    /**
     * nama method yang non native, di pergunakan untuk reload component.
     * misal bootstrap multi select. element itdak normal /terisi setelah listbox di isi ulang
     */
    static RELOAD_NON_NATIVE_COMPONENT_METHOD: string = "reloadComponnent";



    /**
     * key prefix untuk lookup
     */
    static PREFIX_FOR_LOV_LOCAL_STORAGE: string = "gps_corp_lookup";


    /**
     * untuk ajax request ke server
     */
    ajaxUtils: CoreAjaxHelper ;
    /**
     * data lookup. di index dengan id lookup. untuk akses di client
     */
    lookupData: { [id: string]: CommonCommunicationData.CommonLookupValue[] } = {};

    lovComponents: LOVEnabledComponent[];
    /**
     * lookup di index dengan id dari loookup
     */
    indexedLovComponents: { [id: string]: LOVEnabledComponent[] };



    /**
     * nama owner untuk logging
     */
    ownerNameForDebug: string;

    constructor(ajaxUtils: CoreAjaxHelper ) {
        
        this.ajaxUtils = ajaxUtils;
        this.lovComponents = [];
        this.indexedLovComponents = {};
    }



    /**
     * membaca lookup dengan lov id + detail code
     */
    getLookup(lookupId: string, valueCode: string): CommonCommunicationData.CommonLookupValue {
        let looks: CommonCommunicationData.CommonLookupValue[] = this.lookupData[lookupId] || null;
        if (looks == null) {
            return null;
        }
        for (var v of looks) {
            if ((v.detailCode + '') == (valueCode + '')) {
                return v;
            }

        }
        return null;
    }

    /**
     * register lookup
     */
    register(lov: LOVEnabledComponent) {
        if (this.ownerNameForDebug != null && typeof this.ownerNameForDebug != 'undefined' && this.ownerNameForDebug.length > 0) {
            console.log('[', this.ownerNameForDebug, '] komponen ', this.ownerNameForDebug, '.register lookup component : ', lov);
        }
        this.lovComponents.push(lov);
        this.indexedLovComponents[lov.lovId] = this.indexedLovComponents[lov.lovId] || [];
        this.indexedLovComponents[lov.lovId].push(lov);
    }


    /**
     * id dari lookups. dalam editor memerlukan looup apa saja
     */
    getLookupIds(): string[] {
        return Object.keys(this.indexedLovComponents);
    }



    /**
     * request data lookup worker. ini menerima ID dari data dan di proses. di manfaatkan oleh method : <i>requestLookupDataWithLovIds</i> , atau <i>requestLookupDataWithPromise</i>
     * @param ids id dari lookup untuk di request
     * @param modelName nama model, untuk request token
     */
    private requestLookupWithIdWorker(ids: string[], modelName: string, dataId: string, onCacheDataRecieved?: (cache: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any): Promise<LookupWithTokenResponse> {
        if (this.ownerNameForDebug != null && typeof this.ownerNameForDebug != 'undefined' && this.ownerNameForDebug.length > 0) {
            console.log('[', this.ownerNameForDebug, '] komponen ', this.ownerNameForDebug, '.request lookup dengan isian  : ', ids != null && typeof ids != 'undefined' ? ids.join(',') : 'null');
        }
        let logger: (msg: string, ...parma: any[]) => any = (msg: string, ...parma: any[]) => {
            if (this.ownerNameForDebug != null && typeof this.ownerNameForDebug != 'undefined' && this.ownerNameForDebug.length > 0) {
                console.log('[' + this.ownerNameForDebug + ']' + msg, parma);
            }
        }
        return new Promise<LookupWithTokenResponse>(async (accept: (n: LookupWithTokenResponse) => any, reject: (exc) => any) => {
            let rtvl: LookupWithTokenResponse = {
                lookups: {},
                token: null
            };

            if (ids == null || typeof ids == 'undefined' || ids.length == 0) {
                accept(rtvl);
                logger('#requestLookupWithIdWorker request di skup karena id lookup kosong ')
                return;
            }
            let x: LoadLookupFromCacheDataWrapper = await this.loadFromCacheAndGenerateLookupRequestWithPromise(ids);
            if (x.cachedLookups === null) {
                x.cachedLookups = {}
            }
            rtvl.lookups = x.cachedLookups;
            if (onCacheDataRecieved != null && typeof onCacheDataRecieved != 'undefined') {
                onCacheDataRecieved(x.cachedLookups);
            }
            let url: string = "/dynamics/core/lookup-values";
            if (modelName != null && typeof modelName !== 'undefined' && modelName.length > 0) {
                url = "/dynamics/core/" + modelName + "/lookup-values-with-token";
            }
            if (dataId != null && typeof dataId !== 'undefined' && dataId.length > 0) {
                url += "?dataId=" + dataId;
            }
            //ajaxhelper.AjaxUtils.
            let rslAjax: any = null;
            if ((x.lookupRequests != null && typeof x.lookupRequests !== 'undefined' && x.lookupRequests.length > 0) || (modelName != null && typeof modelName !== 'undefined' && modelName.length > 0)) {

                let stringParam: string = JSON.stringify(x.lookupRequests);
                logger('#requestLookupWithIdWorker request ke server dengan param :  ', stringParam)
                rslAjax = await this.ajaxUtils.post(url, {
                    lovrequestparams: stringParam
                });
            }
            if (rslAjax != null) {
                logger('#requestLookupWithIdWorker menerima dat alookup dari server  : ', rslAjax);
                if (modelName != null && typeof modelName !== 'undefined') { // ini db driven. ada model nya , ada token
                    rtvl.token = rslAjax.token;
                    this.processLookupFromServer(rslAjax.lookups, x.cachedLookups);
                } else {
                    this.processLookupFromServer(rslAjax, x.cachedLookups);
                }

            } else {
                logger('#requestLookupWithIdWorker dari server return null untuk lookup');
            }
            if (rtvl.lookups != null && typeof rtvl.lookups !== 'undefined') {
                let keys: string[] = Object.keys(rtvl.lookups);
                for (let k of keys) {
                    this.assignLookupDataToControlWorker(k, rtvl.lookups[k]);
                }
            }
            accept(rtvl);

        });
    }


    /**
     * request lookup data dengan lov ids
     */
    requestLookupDataWithLovIds(ids: string[], onCacheDataRecieved?: (cache: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any): Promise<{ [id: string]: CommonCommunicationData.CommonLookupValue[] }> {

        return new Promise<{ [id: string]: CommonCommunicationData.CommonLookupValue[] }>(async (accept: (n: any) => any, reject: (exc) => any) => {
            if (ids == null || typeof ids == 'undefined' || ids.length == 0) {
                accept(null);
                return;
            }
            this.requestLookupWithIdWorker(ids, null, null, onCacheDataRecieved)
                .then((l: LookupWithTokenResponse) => {
                    accept(l.lookups);
                }).catch(exc => {
                    reject(exc);
                })
        });
    }




    /**
     * memasukan data dari server ke dalam data client 
     */
    private processLookupFromServer(data: CommonCommunicationData.LookupRequestResultWrapper[], targetContainer): Promise<any> {
        let logger: (msg: string, ...parma: any[]) => any = (msg: string, ...parma: any[]) => {
            if (this.ownerNameForDebug != null && typeof this.ownerNameForDebug != 'undefined' && this.ownerNameForDebug.length > 0) {
                console.log('[' + this.ownerNameForDebug + ']' + msg, parma);
            }
        }
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc) => any) => {
            if (data == null || typeof data == 'undefined' || data.length == 0) {
                logger('#processLookupFromServer lookup length 0. di abaikn')
                accept({});
                return;
            }
            for (let l of data) {
                if (l.stillUptodate) {
                    logger('#processLookupFromServer lookup : ', l.loookupId, ' di skip. masih up to date');
                    continue;
                }
                targetContainer[l.loookupId] = l.lookupData.details;
                this.sendToCache(l.lookupData);
                logger('#processLookupFromServer lookup : ', l.loookupId, ' send to cache');
            }
            accept({});
        });
    }

    /**
     * request lookup data ke server
     */
    requestLookupDataWithPromise(lookupParam: LookupWithToken): Promise<LookupWithTokenResponse> {

        return new Promise<LookupWithTokenResponse>(async (accept: (n: any) => any, reject: (exc) => any) => {
            let ids: string[] = lookupParam.lookupIds;
            if (ids == null || typeof ids == 'undefined') {
                ids = [];
            }
            let registeredComponentIds: string[] = Object.keys(this.indexedLovComponents);
            if (registeredComponentIds == null || typeof registeredComponentIds == 'undefined') {
                for (let rComp of registeredComponentIds) {
                    if (ids.indexOf(rComp) < 0) {
                        ids.push(rComp);
                    }

                }

            }
            let h: LookupWithTokenResponse = await this.requestLookupWithIdWorker(ids, lookupParam.modelName, lookupParam.dataIdAsString);
            accept(h);
        });
    }

    /**
     * request lookup data ke server
     */
    requestLookupData(lookupParam: LookupWithToken, onComplete?: (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any) {
        if (onComplete == null || typeof onComplete === "undefined") {
            onComplete = () => { };
        }
        let ids: string[] = Object.keys(this.indexedLovComponents);
        if (ids == null || typeof ids === "undefined" || ids.length === 0) {
            if (onComplete != null && typeof onComplete !== "undefined") {
                onComplete({});
            }
            console.log("[LOV] Dalam form , tidak ada lookup, proses fill lookup di abaikan");
            return;
        }
        this.requestLookupWithIdWorker(ids, lookupParam.modelName, lookupParam.dataIdAsString)
            .then((l: LookupWithTokenResponse) => {
                onComplete(l.lookups);
                if (!isNull(lookupParam.onTokenAccepted)) {
                    lookupParam.onTokenAccepted(l.token);
                }
                if (!isNull(lookupParam.onLookupAccepted)) {
                    lookupParam.onLookupAccepted(l.lookups);
                }
            })
            .catch(exc => {
                onComplete({});
            });
    }




    /**
     * proses lookup data, di terima dari server , di masukan kembali ke dalam control dan cache
     * return : cache yang di update
     */
    processLookupRequestResult(lookups: CommonCommunicationData.LookupRequestResultWrapper[]): { [id: string]: CommonCommunicationData.CommonLookupValue[] } {
        lookups = lookups || null;
        let rtvl: { [id: string]: CommonCommunicationData.CommonLookupValue[] } = {};
        if (lookups == null) {
            return rtvl;
        }

        for (var l of lookups) {
            if (l.stillUptodate) {
                continue;
            }
            if (!isNull(l.lookupData)) {
                rtvl[l.loookupId] = l.lookupData.details;
            }
            this.sendToCache(l.lookupData);
            this.assignLookupDataToControlWorker(l.lookupData.id, l.lookupData.details);
        }
        return rtvl;

    }




    /**
     * mengecek lookup perlu renew atau tidak
     */
    checkIsExpired(cache: CachedLookupDefinition): boolean {
        if (cache.timestamp == null || typeof cache.timestamp === 'undefined') {
            return false;
        }
        let dSkr: number = new Date().getTime();
        let dPRev: number = cache.timestamp.getTime();
        return (dSkr - dPRev) / 1000 > (60 * 30); //lewat 30 menit request ulang
    }




    /**
     * load data dari cache
     * @param ids id dari lookup
     */
    loadFromCache(ids: string[]): Promise<{ [id: string]: CommonCommunicationData.CommonLookupValue[] }> {
        return new Promise<{ [id: string]: CommonCommunicationData.CommonLookupValue[] }>(async (accept: any, reject: any) => {
            if (isNull(ids) || ids.length === 0) {
                accept({});
                return;
            }
            let rtvl: { [id: string]: CommonCommunicationData.CommonLookupValue[] } = {};
            for (let id of ids) {
                let cachedResult: CachedLookupDefinition = await this.readFromCacheWithPromise(id);
                rtvl[cachedResult.id] = cachedResult.lookupData;
            }
            accept(rtvl);
        });

    }

    /**
     * load data dari lookup dan generate lookup request.
     * ini bisa di pergunakan dalam mode edit. jadinya load temporary item dan request ke server
     */
    loadFromCacheAndGenerateLookupRequestWithPromise(ids: string[] /*onComplete : (reqData : CommonCommunicationData.LookupRequestData []) => any*/): Promise<LoadLookupFromCacheDataWrapper> {
        return new Promise<LoadLookupFromCacheDataWrapper>(async (accept: (n: LoadLookupFromCacheDataWrapper) => any, reject: (exc: any) => any) => {
            //let ids: string[] = Object.keys(this.indexedLovComponents);
            if (ids == null || ids.length === 0) {
                accept(null);
                return;
            }

            let retval: LoadLookupFromCacheDataWrapper = {
                cachedLookups: {},
                lookupRequests: []
            }
            for (let id of ids) {
                let cachedResult: CachedLookupDefinition = await this.readFromCacheWithPromise(id);
                if (cachedResult != null && typeof cachedResult != 'undefined' && cachedResult.version != null) {
                    retval.cachedLookups[id] = cachedResult.lookupData;
                    if (this.checkIsExpired(cachedResult)) {
                        retval.lookupRequests.push(
                            {
                                lovId: cachedResult.id,
                                version: cachedResult.version
                            });


                    }
                    retval.cachedLookups[cachedResult.id] = cachedResult.lookupData;
                } else {
                    retval.lookupRequests.push({
                        lovId: cachedResult.id,
                        version: '-101'
                    })
                }
            }
            accept(retval);
        });
    }



    /**
     * alias dari loadFromCacheAndGenerateLookupRequest
     */
    loadFromCacheAndGenerateLookupRequestUsingPromiseAlias(): Promise<CommonCommunicationData.LookupRequestData[]> {
        return new Promise<CommonCommunicationData.LookupRequestData[]>((accept: any, reject: any) => {
            this.loadFromCacheAndGenerateLookupRequest(accept);
        });
    }
    /**
     * load data dari lookup dan generate lookup request.
     * ini bisa di pergunakan dalam mode edit. jadinya load temporary item dan request ke server
     */
    loadFromCacheAndGenerateLookupRequest(onComplete: (reqData: CommonCommunicationData.LookupRequestData[]) => any): any {
        let ids: string[] = Object.keys(this.indexedLovComponents);
        if (ids == null || ids.length === 0) {
            onComplete(null);
            return;
        }
        let retval: CommonCommunicationData.LookupRequestData[] = [];
        let triggerReadFromCache: (index: number) => any = (index: number) => {
            let idLookup: string = ids[index];
            if (idLookup == null || typeof idLookup === "undefined" || idLookup === "") {
                if (index >= ids.length) {
                    onComplete(retval);
                    return;
                }
                triggerReadFromCache(index + 1);
            }
            console.log("[LOV] Membaca lookup dengan index : " + index + ", lookup id : " + ids[index]);
            this.readFromCache(ids[index], (cachedResult: CachedLookupDefinition) => {
                retval.push({
                    lovId: cachedResult.id,
                    version: cachedResult.version || null
                });
                this.assignLookupDataToControlWorker(cachedResult.id, cachedResult.lookupData);
                if (index >= ids.length) {
                    onComplete(retval);
                    return;
                }
                triggerReadFromCache(index + 1);
            });
        };
        triggerReadFromCache(0);

    }




    /**
     * assign data lookup. misal ini di dapat dari generic edit --> /dynamics/rest-api/generic-edit/:pojo/:id, di inject langsung data ke dalam lookup
     */
    assignLookupDataToControls(lookupsData: CommonCommunicationData.CommonLookupHeader[]) {
        if (lookupsData == null || typeof lookupsData === "undefined") {
            return;
        }
        for (var l of lookupsData) {
            this.assignLookupDataToControlWorker(l.id, l.details);
        }
    }


    /**
     * assign lookup ke dalam control
     */
    abstract assignLookupDataToControlWorker(id: string, lovs: CommonCommunicationData.CommonLookupValue[])  ; 



    /**
     * kirim data ke cache( localstorage - chrome storage)
     * @param lookupData
     */
    abstract sendToCache(lookupData: CommonCommunicationData.CommonLookupHeader)  ;

    /**
     * membaca dari local storage atau chrome storage
     */
    abstract readFromCache(id: string, next: (cachedResult: CachedLookupDefinition) => any): any  ; 


    /**
     * membaca dari local storage atau chrome storage
     */
    abstract readFromCacheWithPromise(id: string): Promise<CachedLookupDefinition> ; 

}