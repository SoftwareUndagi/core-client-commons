
import { isNull } from './CommonUtils'; 
/**
 * wrapepr fetch API
 */
export class CoreAjaxHelper {
    /**
         * handler kalau login sudah habis
         */
    static LOGIN_EXPIRED_HANDLER: () => any;


    /**
     * flag enable cross origin atau tidak. normal dalam web = false, untuk chrome app = true 
     */
    static ENABLE_CROSS_ORIGIN_REQUEST: boolean = false;
    baseUrl: string;
    /**
     * constructor util. http akan di pass oleh angular
     */
    constructor(baseUrl ? : string ) {
        this.baseUrl = baseUrl;
    }





    /**
     * generate full url dari service
     * @param serviceUrl url service. ini relative path nya saja
     */
    generateFullUrl(serviceUrl: string): string {
        if (serviceUrl.startsWith("//")) {
            serviceUrl = serviceUrl.substr(1);
        }
        if (isNull(this.baseUrl) || this.baseUrl.length === 0) {
            return serviceUrl;
        }
        let rtvl = this.baseUrl;
        if (this.baseUrl.endsWith('/')) {// base url ada / di akhir
            if (serviceUrl.startsWith('/')) {
                rtvl += serviceUrl.substr(1);
            } else {
                rtvl = rtvl + serviceUrl;
            }
        } else {// tidak di akhiri / pada base, bisa jadi eprlu di tambahkan /
            if (serviceUrl.startsWith('/')) {
                rtvl += serviceUrl;
            } else {
                rtvl = rtvl + '/' + serviceUrl;
            }
        }
    }


    /**
     * check login expired atau tidak. kalau return true , callback tidak akan di panggil, login expired langsung di trigger
     */
    doCheckLoginExpired(ajaxResult: any): boolean {
        if (CoreAjaxHelper.LOGIN_EXPIRED_HANDLER == null || typeof CoreAjaxHelper.LOGIN_EXPIRED_HANDLER == 'undefined') {
            return false;
        }
        if (ajaxResult.errorCode == 'ERROR_LOGIN_EXPIRED') {
            CoreAjaxHelper.LOGIN_EXPIRED_HANDLER();
            return true;
        }
        return false;
    }





    /**
     * invoke get. 
     * promise : success : data , onfailure : {
     *      message : "pesan error" , 
     *      errorCode : "kode error", 
     *      
     * }
     */
    get(url: string): Promise<any> {
        if (!isNull(this.baseUrl) && this.baseUrl.length > 0) {
            url = this.baseUrl + url;
        }
        return new Promise<any>((accept: (d: any) => any, reject: (exc: any) => any) => {
            fetch(url, { credentials: 'include' }).then((d: any) => {
                this.jsonResultHandler(d, accept, reject);
            }).catch((exc: any) => {
                reject(exc);
            });
        });
    }


    generateStringValue(val: any): string {
        if (val == null || typeof val === 'undefined') {
            return null;
        }
        if (typeof val == 'number') {
            return val + '';
        }
        if (typeof val == 'string') {
            return val;
        }
        return JSON.stringify(val);
    }




    /**
     * handler untuk json result
     */
    jsonResultHandler(rawData: Response, accept: (d: any) => any, reject: (exc: any) => any) {
        if (rawData.ok) {
            rawData.json().then((jsonData: any) => {
                if (jsonData.haveError != null && typeof jsonData.haveError != 'undefined') {
                    if (jsonData.haveError) {
                        if (this.doCheckLoginExpired(jsonData)) {
                            return;
                        }
                        console.log('[ajaxhelper.jsonResultHandler] ', jsonData);
                        reject({ additionalErrorData: jsonData.additionalErrorData, message: jsonData.errorMessage, errorCode: jsonData.errorCode });
                        return;
                    }
                }
                accept(jsonData.data);
            });
            return;
        } else {
            reject({ message: 'Network failed, response code :  ' + rawData.status, errorCode: rawData.status });
            return;
        }
    }
    /**
     * perintahkan post dengan raw form data. ini di pakai misal untuk upload file  dengan 
     * @param url url untuk handle request
     * @param formData form data untuk body dari request
     * @param header untuk fetch request
     */
    rawPost(url: string, formData: FormData, header?: any): Promise<any> {
        if (!isNull(this.baseUrl) && this.baseUrl.length > 0) {
            url = this.baseUrl + url;
        }
        return fetch(url, {
            method: 'post',
            headers: header != null && typeof header !== 'undefined' ? header : {
                Accept: 'application/json'
            },
            body: formData,
            credentials: 'include'
        });
    }

    /**
     * worker untuk invoke post 
     */
    post(url: string, postParam: any): Promise<any> {
        if (!isNull(this.baseUrl) && this.baseUrl.length > 0) {
            url = this.baseUrl + url;
        }
        return new Promise<any>((accept: (d: any) => any, reject: (exc: any) => any) => {
            var formData = new FormData();
            formData.append("json", JSON.stringify(postParam));

            console.log('[ajaxhelper] invoke post dengan data :  ', postParam);
            let h: Headers = new Headers();
            h.append('Accept', 'application/json');
            h.append('Content-Type', 'application/json');
            let reqInit: RequestInit = {
                method: 'post',
                redirect: 'follow',
                mode: this.getMode(),
                headers: h,
                body: formData,
                credentials: 'include'
            };
            if (postParam != null && typeof postParam !== 'undefined') {
                reqInit.body = JSON.stringify(postParam);
            }
            let req: Request = new Request(url, reqInit);
            fetch(req).then((d: Response) => {
                this.jsonResultHandler(d, accept, reject);
            }).catch((exc: any) => {
                reject(exc);
            });
        });
    }


    getMode(): any {
        return CoreAjaxHelper.ENABLE_CROSS_ORIGIN_REQUEST ? 'cors' : 'same-origin';
    }




    /**
     * invoke method : put
     */
    put(url: string, param?: any): Promise<any> {
        if (!isNull(this.baseUrl) && this.baseUrl.length > 0) {
            url = this.baseUrl + url;
        }
        return new Promise<any>((accept: (d: any) => any, reject: (exc: any) => any) => {
            let h: Headers = new Headers();
             /* gede sutarsa (14 dec 2017)redundan, ini jadinya pada bagian header ada data yang sama dengab body, jadinya di server request gagal
            if (param != null && typeof param != 'undefined') {
                let keys: string[] = Object.keys(param);
                for (let k of keys) {
                    h.append(k, param[k]);
                }
            }
            */
            h.append('Accept', 'application/json');
            h.append('Content-Type', 'application/json');

            let reqInit: RequestInit = {
                method: 'put',
                redirect: 'follow',
                mode: this.getMode(),
                credentials: 'include',
                headers: h,
            }
            if (param != null && typeof param !== 'undefined') {
                reqInit.body = JSON.stringify(param);
            }
            let req: Request = new Request(url, reqInit);
            fetch(req).then((d: Response) => {
                this.jsonResultHandler(d, accept, reject);
            }).catch((exc: any) => {
                reject(exc);
            });
        });
    }



    /**
     * http delete. disingkat agar tidak bentrok dengan statement delete
     */
    del(url: string): Promise<any> {
        if (!isNull(this.baseUrl) && this.baseUrl.length > 0) {
            url = this.baseUrl + url;
        }
        return new Promise<any>((accept: (d: any) => any, reject: (exc: any) => any) => {
            let req: Request = new Request(url, {
                method: 'delete',
                redirect: 'follow',
                mode: this.getMode(),
                credentials: 'include'
            });
            fetch(req).then((d: any) => {
                this.jsonResultHandler(d, accept, reject);
            }).catch((exc: any) => {
                reject(exc);
            });
        });
    }

    /**
     * ajax dengan method get
     */
    sendAjaxGet<RESULT>(url: string, onSuccess: (data: RESULT) => any, onFailure: (errorCode: string, errorMessage: string, actualException: any) => any) {
        this.get(url).then(d => { onSuccess(d) })
            .catch((exc: any) => {
                onFailure(exc.errorCode, exc.message, exc);
            });
    }

    /**
     * kirim ajax post request
     */
    sendAjaxPost<PARAM, RESULT>(url: string, param: PARAM, onSuccess: (data: RESULT) => any, onFailure: (errorCode: string, errorMessage: string, actualException: any) => any) {
        this.post(url, param).then((d: any) => {
            onSuccess(d);
        })
            .catch(exc => {
                onFailure(exc.errorCode, exc.message, exc);
            })

    }



    /**
     * send <i>PUT</i>
     */
    sendAjaxPut<PARAM, RESULT>(url: string, param: PARAM, onSuccess: (data: RESULT) => any, onFailure: (errorCode: string, errorMessage: string, actualException: any) => any) {
        this.put(url, param).then(d => {
            onSuccess(d);
        }).catch(exc => {
            onFailure(exc.errorCode, exc.message, exc);
        });
    }



    sendAjaxDelete<RESULT>(url: string, onSuccess: (data: RESULT) => any, onFailure: (errorCode: string, errorMessage: string, actualException: any) => any) {
        this.del(url).then(d => {
            onSuccess(d);
        }).catch(exc => {
            onFailure(exc.errorCode, exc.message, exc);
        });

    }

}