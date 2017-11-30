import { isNull } from './CommonUtils';




/**
 * parameter untuk insertToDatabase
 * 
 */
export interface InsertToDatabaseParameter {
    /**
     * nama database
     */
    databaseName: string;
    /**
     * versi dari database
     */
    databaseVersion: number;

    /**
     * nama table
     */
    tableName: string;
    /**
     * data untuk di baca
     */
    data: any | Array<any>
};


/**
 * parameter untuk membaca data by id
 */
export interface ReadByIdParameter {
    /**
     * nama database
     */
    databaseName: string;
    /**
     * versi dari database
     */
    databaseVersion: number;

    /**
     * nama table
     */
    tableName: string;

    /**
     * id dari data
     */
    id : string|number ; 
}





/**
 * parameter berupa array
 */
export interface ReadByIdsParameter {
    /**
     * nama database
     */
    databaseName: string;
    /**
     * versi dari database
     */
    databaseVersion: number;

    /**
     * nama table
     */
    tableName: string;

    /**
     * id dari data
     */
    ids : Array<string>|Array<number> ; 
}


export interface IndexeddbUtilDeleteDataByIdParam {
    /**
     * nama database
     */
    databaseName: string;
    /**
     * versi dari database
     */
    databaseVersion: number;

    /**
     * nama table
     */
    tableName: string;


    /**
     * id dari data untuk di hapus
     */
    id : string|number|Array<string>|Array<number>; 
} 

export class IndexedDbUtils {






    /**
     * delete data dengan id dari data(bisa berupa array juga)
     * @param param 
     */
    static deleteDataById ( param :IndexeddbUtilDeleteDataByIdParam )  : Promise<any|Array<any>> {
        return new Promise< any|Array<any> >( async (accept : (n : any|Array<any> )=> any  , reject : (exc : any )=> any   ) =>{
            if ( isNull(param.id) || ( Array.isArray(param.id) && param.id.length ===0  )) {
                accept(null); 
                return ; 
            }
            let req: IDBOpenDBRequest = indexedDB.open(param.databaseName, param.databaseVersion);
            let db: IDBDatabase = null;
            req.onerror = (ev: Event) => {
                reject(ev.target);
                return;
            }
            req.onsuccess = (ev: Event) => {
                db = req.result;
                let str : any =   db.transaction(param.tableName ,'readwrite').objectStore(param.tableName) ; 
                if ( Array.isArray(param.id)) {
                    let arrExec : any [] = [] ;
                    let ids  : any =  param.id  ;
                    ids.forEach( (id : any)=>{
                        arrExec.push( IndexedDbUtils.deleteDataByIdWorker(str , id));
                    }) ; 
                    Promise.all( arrExec).then( accept).catch(reject);
                }else {
                    IndexedDbUtils.deleteDataByIdWorker( str , param.id)
                        .then( accept)
                        .catch(reject); 
                }
            }

        });
    }





    /**
     * worker untuk hapus single data
     * @param dbStore store untuk hapus data
     * @param id id dari data untuk di hapus
     */
    static deleteDataByIdWorker (dbStore: IDBObjectStore ,id : string|number ) : Promise<any> {
        return new Promise< any >( async (accept : (n : any )=> any  , reject : (exc : any )=> any   ) =>{
            let r : IDBRequest =  dbStore.delete(id); 
            r.onerror = (ev: Event) => {
                reject(ev.target);
                return;
            }
            r.onsuccess = (ev: Event) => {
                accept({}) ;
            }
        });

    }

    /**
     * membaca data dengan id
     * @param param 
     */
    static readById ( param : ReadByIdParameter ) : Promise<any> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            if (isNull(param.id) ) {
                accept(null);
                return;
            }
            let req: IDBOpenDBRequest = indexedDB.open(param.databaseName, param.databaseVersion);
            let db: IDBDatabase = null;
            req.onerror = (ev: Event) => {
                reject(ev.target);
                return;
            }
            req.onsuccess = (ev: Event) => {
                db = req.result;
                IndexedDbUtils.readByIdWorker(db.transaction(param.tableName , 'readonly').objectStore(param.tableName) , param.id)
                    .then(accept)
                    .catch( reject) ; 
                
            }
        });
    }


    /**
     * worker untuk membaca data dengan id dari data. untuk di share dengan 
     * @param store storage untuk membaca data
     * @param id ID dari data untuk di baca
     */
    static readByIdWorker (store : IDBObjectStore , id : string|number ) : Promise<any> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            let ob : IDBRequest  = store.get(id) ;
            ob.onerror=(  ev: Event) =>{
                reject (ev.target); 
                return ; 
            } 
            ob.onsuccess= (  ev2: any) =>{
                accept( ev2.target.result ) ; 
            }
        });
    }

    /**
     * membaca dengan array of id
     * @param store 
     * @param ids 
     */
    static readByIdsWorker (store : IDBObjectStore , ids : string[]|number[] ) : Promise<any[]> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            let rtvl : any[] =  [] ; 
            for ( let id of ids) {
                let r : any = await IndexedDbUtils.readByIdWorker( store , id); 
                rtvl.push(r);
            }
            accept(rtvl); 
        });
    }


    /**
     * membaca dari indexed db dengan array of id dari dta
     * @param param 
     */
    static readByIds (param : ReadByIdsParameter ) : Promise< Array<any>> { 
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            if (isNull(param.ids) ) {
                accept([]);
                return;
            }
            let req: IDBOpenDBRequest = indexedDB.open(param.databaseName, param.databaseVersion);
            let db: IDBDatabase = null;
            req.onerror = (ev: Event) => {
                reject(ev.target);
                return;
            }
            req.onsuccess = (ev: Event) => {
                db = req.result;
                let store : IDBObjectStore  = db.transaction(param.tableName , 'readonly').objectStore(param.tableName)  ; 
                IndexedDbUtils.readByIdsWorker(store , param.ids)
                    .then( accept)
                    .catch(reject);
            }
        });
    }


    
    /**
     * insert data ke dalam databse indexed db
     * @param param parameter insert data
     */
    static insertToDatabase(param: InsertToDatabaseParameter): Promise<any> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            if (isNull(param.data) || (Array.isArray(param.data) && param.data.length == 0)) {
                accept({});
                return;
            }
            let req: IDBOpenDBRequest = indexedDB.open(param.databaseName, param.databaseVersion);
            let db: IDBDatabase = null;
            req.onerror = (ev: Event) => {
                reject(ev.target);
                return;
            }
            req.onsuccess = (ev: Event) => {
                db = req.result;
                console.log('[indexedDB] on insert done')
                let str: IDBObjectStore = db.transaction(param.tableName, "readwrite").objectStore(param.tableName);
                if (Array.isArray(param.data)) {
                    for (let c of param.data) {
                        str.put(c);
                    }
                } else {
                    str.put(param.data);
                }
                accept({});
            }
        });
    }

}


