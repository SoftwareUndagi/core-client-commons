
import { CommonCommunicationData } from  '../shared/CommonCommunicationData';

import { CoreAjaxHelper } from './CoreAjaxHelper';  

/**
 * ajax utils untuk core ajax(bawaan)
 */
export class CoreComponentAjaxUtils {
    constructor(private ajaxUtils: CoreAjaxHelper ) {}

    /**
     * worker membaca data. data di baca dengan get
     * @param id id dari data yang perlu di baca( string atau number)
     * @param modelName nama model yang di handle dengan sequelize
     * @param includeModels association yang di sertakan 
     * @param onDataRecieved handler data recieved
     * @param onFailure handler ajax failed
     */
    getDataById<DATA> ( id: number|string , modelName: string , includeModels: CommonCommunicationData.IncludeModelParam[],  onDataRecieved: (data: DATA) => any  ,  onFailure: (code: string, message: string , exc: any ) => any ) {
        let url: string = '/dynamics/rest-api/generic/'  + modelName + '/' + id + "?apiMarker=" + new Date().getTime() + "&" ; 
        if ( includeModels != null && typeof includeModels !== 'undefined' && includeModels.length > 0) {
            url += 'includedModels=' + btoa(JSON.stringify(includeModels)) ; 
        }
        this.ajaxUtils.sendAjaxGet(url , onDataRecieved , onFailure);
    }
    /**
     * mengecek kalau ada constraint violation dalam data
     * @param modelName {string} nama model yang perlu di cek model nya 
     * @param fieldName nama field yang di cek ke model. ini bisa nama js atau nama column 
     * @param fieldValue nilai yang perlu di cek bentrok apa atau tidak
     * @param objectId id dari object. dalam kasus update, pengecekan tidak di lakukan pada object yang sama
     */
    checkForUniqueKeyViolation ( modelName: string , fieldName: string , fieldValue: string , objectId?: string|number  ): Promise<boolean> {
        return new Promise<boolean>(  ( accept: (n: any ) => any , reject: (exc: any ) => any ) => {
            let url: string = "/dynamics/general-purpose/check-unique-field-violation/" + modelName ; 
            let d: any = {
                fieldToCheck : fieldName , 
                value : fieldValue 
            };
            if ( !!objectId) {
                d.dataId = objectId  ; 
                d.primaryKeyIsNumber  = typeof objectId === 'number'; 
            }
            this.ajaxUtils.post( url , d).then( (rslt: any ) => {
                accept(rslt.constraintViolation);
            }).catch( reject);
        }); 
    }
    /**
     * worker membaca ata dengan paged
     */
    getPagedData <DATA> ( 
        param: CommonCommunicationData.PagedDataRequest<DATA>, 
        onDataRecieved: (data: CommonCommunicationData.PagedDataQueryResult<DATA> ) => any ,   
        onFailure: (code: string, message: string , exc: any ) => any  , url ?: string ) {
        let actUrl: string = '/dynamics/core/get-paged-data.svc' ; 
        if ( url != null && typeof url !== 'undefined') {
            actUrl = url ; 
        }
        if ( param.page == null || typeof param.page === 'undefined') {
            param.page = 0 ; 
        }
        let jsString: string = btoa(JSON.stringify(param)) ;    
        this.ajaxUtils.sendAjaxPost(  actUrl, {q : jsString} , onDataRecieved , onFailure);
    }
    /**
     * membaca data single. data di kembalikan dengan promise
     */
    getDataByIdWithPromise<DATA>(id: number | string, modelName: string, includeModels?: CommonCommunicationData.IncludeModelParam[]): Promise<DATA> {
        let url: string = '/dynamics/rest-api/generic/'  + modelName + '/' + id + "?apiMarker=" + new Date().getTime() + "&" ; 
        if ( includeModels != null && typeof includeModels !== 'undefined' && includeModels.length > 0) {
            url += 'includedModels=' + btoa(JSON.stringify(includeModels)) ; 
        }
        return this.ajaxUtils.get(url );
    }
    /**
     * versi fetch data paged dengan tipe promise
     * @param requestorModuleName nama module yang di merequest data
     * @param param parameter ajax request
     */
    getPagedDataWithPromise<DATA>  (param: CommonCommunicationData.PagedDataRequest<DATA> , requestorModuleName  ?: string ): Promise<CommonCommunicationData.PagedDataQueryResult<DATA>> {
        if ( param.page === null || typeof param.page === 'undefined') {
            param.page = 0 ; 
        }
        let jsString: string = btoa(JSON.stringify(param)) ;    
        let url: string = '/dynamics/core/get-paged-data.svc'  ; 
        if ( !!requestorModuleName  && requestorModuleName.length > 0) {
            url += "?requestorModuleName=" + requestorModuleName!.split(' ').join('_');
        }
        return this.ajaxUtils.post(url , {
            q : jsString
        } );
    } 
    /**
     * checker null
     */
    isNull (param: any ): boolean  {
        return param == null || typeof param === 'undefined'; 
    }

    /**
     * membaca data batch. semua data di baca dari database . di kembalikan sekalian dalam single array. 
     * jadinya looping pembacaand ata di lakukan dlaam method ini. hasil di kembalikan langsung dalam data yang sudah ready
     */
    getAllDataBatched<DATA> (param: CommonCommunicationData.PagedDataRequest<DATA>, onDataRecieved ?: ( recievedData: DATA[] ) => any ): Promise<DATA[]> {
        return new Promise<DATA[]> (  ( accept: (d: DATA[] ) => any , reject: (exc: any ) => any   ) => {
            if ( param.page == null || typeof param.page === 'undefined') {
                param.page = 0 ; 
            }
            let d: DATA[] = [] ;
            let fetchHelper: (  param: CommonCommunicationData.PagedDataRequest<DATA> ) => any  = (  paramInternal: CommonCommunicationData.PagedDataRequest<DATA> ) => {
                let jsString: string = btoa(JSON.stringify(paramInternal)) ;    
                this.ajaxUtils.post('/dynamics/core/get-paged-data.svc'  , {
                    q : jsString
                } ).then( (r: CommonCommunicationData.PagedDataQueryResult<DATA> ) => {
                    if ( !this.isNull(onDataRecieved)) {
                        onDataRecieved!(r.rows!); 
                    }
                    if  ( this.isNull ( r.rows) || r.rows!.length === 0 ) {
                        accept(d) ; 
                        return ; 
                    } 
                    d.push(... r.rows!) ; 
                    if ( r.rows!.length !== paramInternal.pageSize) {
                        accept(d) ;
                        return ; 
                    }
                    paramInternal.page = paramInternal.page + 1 ; 
                    fetchHelper(paramInternal); 
                } )
                .catch( (exc: any )   => {
                    reject(exc); 
                    return ; 
                } );
            }; 
            fetchHelper(param) ; 
            
        } ) ; 
        
    } 

}
