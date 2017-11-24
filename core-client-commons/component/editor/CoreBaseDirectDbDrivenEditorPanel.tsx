
import * as React from "react";
import { ReactEditorBannerMessage } from './EditorComponent';
import { CoreBaseReactEditorPanel, CoreBaseReactEditorPanelState } from "./CoreBaseReactEditorPanel";
import { CommonCommunicationData, LookupWithTokenResponse } from "../../shared/index";
import { AdditionalEditorTask } from './EditorComponentData';
import { isNull, readNested, setValueHelper, cloneObject, ObjectUtils } from '../../utils/index';
import { } from '../ListOfValueComponent';
import { CustomValidationFailureResult } from "./CommonsInputElement";











/**
 * state untuk data id
 */
export interface CoreBaseDirectDbDrivenEditorPanelState<DATA, ID> extends CoreBaseReactEditorPanelState<DATA> {
    id?: ID;

    /**
     * enable edit. ini untuk enable/ disable button, dalam proses submit data button di block
     */
    editingModeEnabled?: boolean;
    /**
    * token untuk proses edit
    */
    editorDataToken?: string;

    /**
     * banner message. sebaiknya di tampilkan pada bagian atas dari data
     */
    bannerMessages?: ReactEditorBannerMessage[];
}



/**
 * parameter untuk behavoir editor pada saat save selesai
 */
export interface EditorBehaviorOnSaveDoneParameter {


    /**
     * flag apakah close pada saat save selsai atau tidak
     */
    closeOnSaveSucess: boolean;

    /**
     * berapa milisecond editor di tutup
     */
    closeDelay: number;
}


/**
 * propseditor. passed ke dalam editor
 */
export interface CoreBaseDirectDbDrivenEditorPanelProps<DATA, ID> {
    /**
     * handler untuk nutup panel. 
     */
    closeCommand: () => any;


    /**
     * task tambahan setelah add/ update/delete
     */
    afterEditTask: (data: DATA) => any;


    /**
     * state dari editor. add , edit atau delete
     */
    editorState: 'add' | 'edit' | 'delete' | 'view';

    /**
     * bekerja dalam kasus editorState = add. data di kirimkan ke dalam panel
     */
    dataForAddNew?: DATA;

    /**
     * data yang akan di edit
     */
    dataIdToEdit?: ID;
    /**
     * react built in
     */
    key?: string;

    /**
     * 
     */
    doNotCallEditorOnInit?: boolean;


    /**
     * parameter untuk perilaku editor dalam kasus save done. ini di pergunakan untuk pada saat save done
     */
    editorBehaviorOnSaveDoneParameter?: EditorBehaviorOnSaveDoneParameter


}




/**
 * interface untuk editor dengan DB driven 
 */
export abstract class CoreBaseDirectDbDrivenEditorPanel<DATA, ID, PROP extends CoreBaseDirectDbDrivenEditorPanelProps<DATA, ID>, STATE extends CoreBaseDirectDbDrivenEditorPanelState<DATA, ID>> extends CoreBaseReactEditorPanel<DATA, PROP, STATE>  {






    /**
     * flag lookup sudah pernah di request atau tidak
      */
    lovRequested: boolean;

    /**
     * nama method del.timpa ini kalau misal memerlukan method post dengan <i>sendAjaxPost</i>
     */
    deleteAjaxMethodName: 'sendAjaxPut' | 'sendAjaxDelete' | 'sendAjaxPost' = 'sendAjaxDelete';

    /**
     * task tambahan edit 
     */
    additionalOnAddTaskHandlers: AdditionalEditorTask<DATA>[];

    /**
     * additional task after erase
     */
    additionalOnEraseTaskHandlers: AdditionalEditorTask<DATA>[];

    /**
     * additional task on edit
     */
    additionalOnEditTaskHandlers: AdditionalEditorTask<DATA>[];

    /**
     * task on view
     */
    additionalOnViewTaskHandlers: AdditionalEditorTask<DATA>[];

    /**
     * handler data not found. kasus konfirmasi delete
     */
    dataNotFoundOnDeleteHandler: (notFoundFlag: boolean) => any;


    /**
     * comand untuk tutup panel
     */
    closeCommand: () => any;

    /**
     * default handler untuk submit
     */
    defaultSubmitHandler: (evt: any) => any = (evt: any) => {
        evt.preventDefault();
        if (this.state.editorState == 'add') {
            this.saveAdd();
        } if (this.state.editorState == 'edit') {
            this.saveEdit();

        } if (this.state.editorState == 'delete') {
            this.saveDelete();
        }
        return false;
    }








    constructor(props: PROP) {
        super(props);
        this.additionalOnAddTaskHandlers = [];
        this.additionalOnAddTaskHandlers.push((d) => { this.additionalTaskOnAdd(d) });
        this.additionalOnEraseTaskHandlers = [];
        this.additionalOnEraseTaskHandlers.push((d2) => { this.additionalTaskOnErase(d2) });
        this.additionalOnEditTaskHandlers = [];
        this.additionalOnEditTaskHandlers.push((d2) => { this.additionalTaskOnedit(d2) });
        this.additionalOnViewTaskHandlers = [];
        this.additionalOnViewTaskHandlers.push((d2) => { this.additionalTaskOnView(d2) });
        this.dataNotFoundOnDeleteHandler = (notFoundFlag: boolean) => {

        };
        let swapState: any = this.state;
        swapState.editingModeEnabled = true;
        swapState.bannerMessages = [];
        swapState.editingModeEnabled = true;

    }



    /**
     * task tambahan untuk edit. override ini kalau di perlukan
     */
    additionalTaskOnedit(data: DATA) {
        console.log("additionalTaskOnedit tidak melakukan apapun.override jika di perlukan");
    }

    /**
     * short cut ke state.currentEditedData 
     */
    get currentEditedData() {
        return this.state.currentEditedData;
    }
    /**
     * editor state. shortcute ke state.editorState
     */
    get editorState(): string {
        if (this.state == null || typeof this.state == 'undefined') {
            return null;
        }
        return this.state.editorState;
    }


    /**
     * task tambahan saat lookup di terima
     * @param lookups data lookup dari cache atau server
     * @param targetState state tujuan anda perlu menyalin, tidak perlu set state
     */
    additionalTaskOnLookupRecieved(targetState: STATE, lookups: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) {

    }

    /**
     * task tambahan pada saat view data
     * @param data data untuk di view
     */
    additionalTaskOnView(data: DATA) {
        console.log("additionalTaskOnView tidak melakukan apapun.override jika di perlukan");
    }


    /**
     * task tambahan on dalam proses add
     * @param data data baru
     */
    additionalTaskOnAdd(data: DATA) {
        console.log("additionalTaskOnAdd tidak melakukan apapun.override jika di perlukan");
    }

    /**
     * task untuk hapus
     * @param data data untuk di hapus
     */
    additionalTaskOnErase(data: DATA) {
        console.log("additionalTaskOnErase tidak melakukan apapun.override jika di perlukan");
    }

    /**
     * task tambahan pada saat component mount
     */
    additionalTaskOnMount() { }
    componentWillMount() {
        this.closeCommand = this.props.closeCommand;
        console.log('[CoreBaseDirectDbDrivenEditorPanel]Component mount : ', this.props);
        let stateData: any = { editorState: this.props.editorState };
        if (this.props.editorState == 'edit' || this.props.editorState == 'view' || this.props.editorState == 'delete') {
            //this.state.
            stateData.id = this.props.dataIdToEdit;
        }
        else if (this.props.editorState == 'add') {
            //this.state.currentEditedData
            //stateData.currentEditedData = this.props.dataForAddNew ;

        }
        let swapState: any = this.state;
        Object.keys(stateData).forEach(k => {
            swapState[k] = stateData[k];
        });
        this.additionalTaskOnMount();
    }

    componentDidMount() {
        let doNotCall: boolean = this.props.doNotCallEditorOnInit;
        if (isNull(doNotCall)) {
            doNotCall = false;
        }

        if (!doNotCall) {
            if (this.props.editorState == 'add') {
                //this.state.currentEditedData
                this.addNewData(this.props.dataForAddNew);
            }
            else if (this.props.editorState == 'edit') {
                this.editData(this.props.dataIdToEdit);
            }
            else if (this.props.editorState == 'view') {
                this.viewData(this.props.dataIdToEdit);
            }
            else if (this.props.editorState == 'delete') {
                this.deleteConfirmation(this.props.dataIdToEdit);
            }
        }

    }






    /**
     * membaca data id as string. ini untuk edit
     */
    abstract getDataIdAsString(data: DATA): string;

    /**
     * tutup editor. gunakan ini untuk tombol tutup
     */
    close() {
        this.closeCommand();
    }


    /**
     * worker untuk kofirmasi delete
     */
    deleteConfirmation(id: ID) {
        this.requestDataForEdit(id, 'delete', this.additionalOnEraseTaskHandlers, this.dataNotFoundOnDeleteHandler);
    }

    /**
     * worker untuk edit.
     * ini akan otomatis request data + lookkup
     */
    editData(id: ID) {
        this.requestDataForEdit(id, 'edit', this.additionalOnEditTaskHandlers, this.dataNotFoundOnDeleteHandler);
    }


    /**
     * nama model
     */
    abstract getModelName(): string;

    /**
     * ini di pergunakan untuk menaruh max length dalam textbox.<br/>
     * misal table sec_user field : username di database panjang = 128.<br/>
     * <ol> 
     * <li>nama model sequelize : ApplicationUserSimple </li>
     * <li>nama field sequelize : userName </li>
     * </ol>
     * di akses dengan : this.getColMaxLength('userName' , 'ApplicationUserSimple')<br/>
     * 
     * @param fieldName nama field js untuk di baca metadata
     * @param modelName nama model dair object penyimpanan data. ini optional.di sediakan default untuk item ini
     */
    abstract getColMaxLength(fieldName: string, modelName?: string): number;
    /**
     * model yang di include pada saat read. override ini kalau memang memerlukan field tambahan
     */
    getIncludeModels(): CommonCommunicationData.IncludeModelParam[] {
        return null;
    }
    /**
     * generate get data url. ini sudah harus menyertakan minimall 1 parameter, agar penambahan parameter menjadi sederhana
     * @param modelName nama model yang perlu di baca
     * @param dataId id dari data yang perlu di baca
     */
    generateGetDataUrl(modelName: string, dataId: ID): string {
        return "/dynamics/rest-api/generic-edit/" + modelName + "/" + dataId + "?thisFramework=rocksolid";
    }


    /**
    * generate data untuk di delete. override kalau memerlukan handler dedicated
    */
    generateDeleteUrl(idAsString: string): string {
        return "/dynamics/commons/direct-data/" + this.getModelName() + "/" + idAsString + "/" + this.state.editorDataToken + "/delete.svc";
    }


    /**
     * url untuk update changed data
     */
    generateUpdateDataUrl(): string {
        return "/dynamics/commons/direct-data/simple-update.svc";
    }


    /**
     * geerator save data
     */
    generateSaveAddParam(): any {
        return {
            data: this.state.currentEditedData,
            token: this.state.editorDataToken

        };
    }


    /**
    * geerator save delete
    */
    generateSaveDeleteParam(): any {
        return {
            token: this.state.editorDataToken

        };
    }

    /**
     * generate add new data url
     */
    generateAddDataUrl(): string {
        return "/dynamics/commons/direct-data/" + this.getModelName() + "/simple-insert.svc";
    }
    /**
     * field-field yang boleh di update. karena server memerlukan nama field untuk di update
     */
    getUpdateAbleFields(): string[] {
        return null;
    }



    /**
     * memaksa lookup manager untuk reload
     */
    requestLookupReload() {
        if (this.lookupManager.getLookupIds().length > 0) {
            this.lookupManager.requestLookupData({
                dataIdAsString: null,
                modelName: this.getModelName(),
                onTokenAccepted: (token: string) => {

                },
                onLookupAccepted: (lookups) => {


                }
            });
        }
    }


    /**
     * worker untuk add new data. pergunakan hanya ini untuk add new data
     */
    addNewData(newData: DATA, callback?: () => any) {

        this.addNewDataWorker(newData)
            .then(d => {
                if (!isNull(callback)) {
                    callback();
                }
            })
            .catch(exc => { })



    }



    /**
     * worker untuk membuat data
     */
    addNewDataWorker(newData: DATA): Promise<any> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc) => any) => {
            let completionTaskAndDoAccept: () => any = () => {
                setTimeout(() => {
                    this.applyDataToControls(newData);
                    for (var addHdlr of this.additionalOnAddTaskHandlers) {
                        addHdlr(newData);
                    }
                }, 200);
                accept({});
            }
            this.setStateHelper(st => {
                st.editorState = 'none';
            });


            let ids: string[] = this.lookupManager.getLookupIds();
            if (!this.lovRequested && !isNull(ids) && ids.length > 0) {
                console.log('[CoreBaseDirectDbDrivenEditorPanel] request data dengan lookup : ', ids.join(','));
                this.lovRequested = true;
                let d: LookupWithTokenResponse = await this.lookupManager.requestLookupDataWithPromise({
                    lookupIds: ids,
                    modelName: this.getModelName(),
                    onTokenAccepted: (tkn: string) => { },
                    onLookupAccepted: (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => { }
                });
                this.setStateHelper(sln => {
                    sln.editorDataToken = d.token;
                    if (isNull(sln.lookups)) {
                        sln.lookups = {};
                    }
                    if (!isNull(d.lookups)) {
                        let keys: string[] = Object.keys(d.lookups);
                        for (let k of keys) {
                            sln.lookups[k] = d.lookups[k];
                        }
                    }
                    this.additionalTaskOnLookupRecieved(sln, d.lookups);
                    sln.currentEditedData = newData;
                    sln.editorState = 'add';
                    sln.id = null;

                }, () => {
                    completionTaskAndDoAccept();
                });

            }
            else {
                let token: string = await this.requestEditDataTokenWithPromise(null);
                this.setStateHelper(sln => {
                    sln.editorDataToken = token;
                    sln.currentEditedData = newData;
                    sln.editorState = 'add';
                    sln.id = null;
                }, () => {
                    completionTaskAndDoAccept();
                });
            }

        });
    }



    /**
     * request token dan langsung update token di editor
     */
    requestAndUpdateToken() {
        let id: string = null;
        if (['edit', 'delete'].indexOf(this.state.editorState) >= 0) {
            id = this.getDataIdAsString(this.state.currentEditedData);
        }
        this.requestEditDataTokenWithPromise(id)
            .then(d => {
                this.setStateHelper(sln => {
                    sln.editorDataToken = d;
                })
            })
            .catch(exc => {
                console.error('[CoreBaseDirectDbDrivenEditorPanel] gagal request token, error : ', exc);
            });

    }

    /**
     * request token edit dari server. kalau erorr code bukan
     */
    requestEditDataTokenWithPromise(objectId: string): Promise<string> {
        return new Promise<string>(async (accept: (n: string) => any, reject: (exc: any) => any) => {
            let url: string = "/dynamics/rest-api/generic/" + this.getModelName() + "/double-submit-token-generator.svc";
            if (!isNull(objectId) && objectId.length > 0) {
                url += "?objectId=" + objectId;
            }
            let token: string = await this.ajaxUtils.get(url);
            accept(token);
        });
    }


    /**
     * request token sekaligus update token di editor
     * @param objectId 
     */
    requestEditDataTokenFacade(objectId: string): Promise<string> {
        return new Promise<string>(async (accept: (n: string) => any, reject: (exc: any) => any) => {
            this.requestEditDataTokenWithPromise(objectId)
                .then(d => {
                    this.setStateHelper(st => {
                        st.editorDataToken = d;
                    }, () => {
                        accept(d);
                    })
                })
                .catch(exc => {
                    this.setStateHelper(stExc => {
                        stExc.bannerMessages = [{
                            type: 'error',
                            title: "TOKEN_NOT_AVAILABLE",
                            message: "Token Untuk edit tidak bisa di request(error : ) + " + exc.message + ",data tidak bisa di simpan kembali. silakan di ulangi kembali"
                        }];
                    }, () => {
                        reject(exc);
                    });
                });
        });
    }

    /**
     * request token edit dari server. kalau erorr code bukan
     */
    requestEditDataToken(onSuccess: (token: string) => any, onFailure: (code: string, message: string, actualException: any) => any, objectId?: string) {
        let self: CoreBaseDirectDbDrivenEditorPanel<DATA, ID, PROP, STATE> = this;
        let url: string = "/dynamics/rest-api/generic/" + this.getModelName() + "/double-submit-token-generator.svc";
        if (!isNull(objectId) && objectId.length > 0) {
            url += "?objectId=" + objectId;
        }

        self.ajaxUtils.sendAjaxGet(url, a => {
            let tkn: any = a;
            onSuccess(tkn);

        },
            onFailure);

    }







    private requestDataForEdit(dataID: ID, editorState: string, additionalEditTasks: AdditionalEditorTask<DATA>[], onDataNotFoundHandler: (notFoundFlag: boolean) => any): Promise<any> {
        return new Promise<any>(async (accept: any, reject: any) => {
            if (this.state.editorState !== 'none') {
                this.setStateHelper(st => { st.editorState = 'none'; });
            }
            let sw: any = editorState;
            // handler kalau data sudah di terima. ini untuk update state
            let proccesorEditData: (targetSate: STATE, editData: CommonCommunicationData.EditDataWrapper<DATA>) => any = (targetSate: STATE, editData: CommonCommunicationData.EditDataWrapper<DATA>) => {
                let lookups: CommonCommunicationData.LookupRequestResultWrapper[] = editData.lookups;
                if (!isNull(lookups)) {
                    // update cache local
                    let updatedCached: { [id: string]: CommonCommunicationData.CommonLookupValue[] } = this.lookupManager.processLookupRequestResult(lookups);
                    if (isNull(targetSate.lookups)) {
                        targetSate.lookups = {};
                    }
                    ObjectUtils.copyField(updatedCached, targetSate.lookups);
                    this.additionalTaskOnLookupRecieved(targetSate, targetSate.lookups);
                }
                targetSate.editorState = editorState;
                targetSate.currentEditedData = editData.editedData;
                targetSate.editorDataToken = editData.editDataToken;
                targetSate.id = dataID;
            }

            // facade kalau edit data di terima
            let editDataAcceptedHandler: (editData: CommonCommunicationData.EditDataWrapper<DATA>) => any = (editData: CommonCommunicationData.EditDataWrapper<DATA>) => {
                if (isNull(editData)) {
                    onDataNotFoundHandler(true);
                    accept({});
                    return;
                } else {
                    onDataNotFoundHandler(false);
                }
                this.setStateHelper(salin => {
                    proccesorEditData(salin, editData);
                    return salin;
                }, () => {
                    this.applyDataToControls(editData.editedData);
                    for (var xxEdit of additionalEditTasks) {
                        xxEdit(editData.editedData);
                    }
                    accept({});
                });
            }

            try {
                let url: string = this.generateGetDataUrl(this.getModelName(), dataID);
                let incs: CommonCommunicationData.IncludeModelParam[] = this.getIncludeModels() || null;
                if (incs != null && incs.length > 0) {
                    url += "&includedModels=" + btoa(JSON.stringify(incs));
                }
                if (editorState === "view") {
                    url = url + "&includeToken=N";
                }
                if (this.lovRequested || this.lookupManager.getLookupIds().length === 0) { // kalau lookup sudah di request
                    console.log("[CoreBaseDirectDbDrivenEditorPanel] lovRequested :  ", this.lovRequested, " lookup size : ",
                        this.lookupManager.getLookupIds().length, ".edit tanpa data lookup di kirim ke server");
                    let noLovRequest: CommonCommunicationData.EditDataWrapper<DATA> = await this.ajaxUtils.get(url);
                    editDataAcceptedHandler(noLovRequest);
                    return;
                } else {
                    this.lovRequested = true;
                    let lookupCached: { [id: string]: CommonCommunicationData.CommonLookupValue[] } = await this.lookupManager.loadFromCache(this.lookupManager.getLookupIds());
                    if (!isNull(lookupCached)) {
                        this.setStateHelper(st => {
                            ObjectUtils.copyField(lookupCached, st.lookups);
                        });
                    }
                    let lookupReqs: CommonCommunicationData.LookupRequestData[] = await this.lookupManager.loadFromCacheAndGenerateLookupRequestUsingPromiseAlias();
                    lookupReqs = lookupReqs || null;
                    if (lookupReqs == null || lookupReqs.length === 0) {
                        let a: CommonCommunicationData.EditDataWrapper<DATA> = await this.ajaxUtils.get(url);
                        editDataAcceptedHandler(a);
                        return;
                    }
                    url = url + "&lookupFields=" + btoa(JSON.stringify(lookupReqs));
                    console.log("[CoreBaseDirectDbDrivenEditorPanel] lookup size : ", this.lookupManager.getLookupIds().length,
                        ".ke server di request dengan params : ", lookupReqs);
                    let withLovReq: CommonCommunicationData.EditDataWrapper<DATA> = await this.ajaxUtils.get(url);
                    editDataAcceptedHandler(withLovReq);
                    return;
                }
            } catch (exc) {
                console.error('[CoreBaseDirectDbDrivenEditorPanel#requestDataForEdit] gagal memproses edit data, error : ', exc);
                let errorCode: string = exc.errorCode;
                let errorMessage: string = exc.message;
                let empty: any = {};
                this.setStateHelper(salin => {
                    salin.editorState = sw;
                    salin.currentEditedData = empty;

                    return salin;
                }, () => {
                    if (additionalEditTasks != null) {
                        for (var tsk of additionalEditTasks) {
                            tsk(null);
                        }
                    }
                    onDataNotFoundHandler(true);
                    reject(exc);
                });
            }
        });

    }





    /**
     * valifasi dalam edit
     *   * @param editedData data yang di add, ini di validasi field nya 
     * @param errorMessages container error message. kalau misalnya ada
     */
    validateEditData(editedData: DATA, errorMessages: ReactEditorBannerMessage[]): boolean {
        return true;
    }



    /**
     * menaruh ke data banner message untuk di render ke dalam error info
     * @param messages messages untuk di taruh
     */
    putToBannerMessage(messages: ReactEditorBannerMessage[]) {
        this.setStateHelper(sln => { sln.bannerMessages = isNull(messages) ? null : messages; });
    }



    /**
     * worker untuk delete data
     */
    saveDelete(saveCallback?: (data: DATA) => any, errorCallback?: (code: string, message: string, exc: any) => any): any {

        this.setStateHelper(st => {
            st.bannerMessages = [];
            st.editingModeEnabled = false;
        },
            () => {
                let idDataToEdit: string = this.getDataIdAsString(this.state.currentEditedData);
                let done: (affected: number) => any = (affected: number) => {
                    CoreBaseDirectDbDrivenEditorPanel.SHOW_INFO_MESSAGE('Hapus Berhasil', 'Data sukses di hapus. berikut ini adalah detail dari data',
                        () => {
                            this.close();
                            if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                                this.props.afterEditTask(this.currentEditedData);
                            }

                        });
                };
                let errHandler: (code: string, message: string, exc: any) => any = (code: string, message: string, exc: any) => {
                    CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE(code, message, exc,
                        () => {
                            this.setStateHelper(st => {
                                st.bannerMessages.push({
                                    type: 'error',
                                    title: code,
                                    message: message
                                });
                            }, () => {
                                this.taskAfterEraseDone(this.state.currentEditedData);
                            });
                        });

                }
                if (this.deleteAjaxMethodName == 'sendAjaxDelete') {
                    this.ajaxUtils.sendAjaxDelete(this.generateDeleteUrl(idDataToEdit),
                        done, errHandler
                    );
                } else if (this.deleteAjaxMethodName == 'sendAjaxPost') {
                    let delParam: any = this.generateSaveDeleteParam();
                    delParam.token = this.state.editorDataToken;
                    this.ajaxUtils.sendAjaxPost(this.generateDeleteUrl(idDataToEdit), delParam,
                        done, errHandler
                    );
                } else if ('sendAjaxPut' == this.deleteAjaxMethodName) {
                    let delParam: any = this.generateSaveDeleteParam();
                    delParam.token = this.state.editorDataToken;
                    this.ajaxUtils.sendAjaxPut(this.generateDeleteUrl(idDataToEdit), delParam,
                        done, errHandler
                    );
                }
            });




    }










    /**
     * generator message untuk banner message. kalau memerlukan message yang berbeda, ini yang harus di override
     */
    taskAfterSaveAddSuccessGenerateBannerMessage(data: DATA): ReactEditorBannerMessage {
        return {
            type: 'error',
            title: "Simpan selesai",
            message: "Tambah data baru sukses di simpan, berikut ini adalah detail dari data"
        };
    }
    /**
     * handler pada saat add selesai di proses di server
     */
    taskAfterSaveAddSuccess(data: DATA) {
        let dummyParam: EditorBehaviorOnSaveDoneParameter = {
            closeDelay: 0,
            closeOnSaveSucess: false
        }
        if (!isNull(this.props.editorBehaviorOnSaveDoneParameter)) {
            dummyParam = this.props.editorBehaviorOnSaveDoneParameter;
        }

        if (dummyParam.closeOnSaveSucess) {
            if (isNull(dummyParam.closeDelay) || dummyParam.closeDelay == 0) {
                dummyParam.closeDelay = 2000;
            }
            setTimeout(() => {
                this.props.closeCommand();
                if (!isNull(this.props.afterEditTask)) {
                    this.props.afterEditTask(data);
                }
            }, dummyParam.closeDelay);
        } else {
            let swapClose: () => any = () => {
                this.props.closeCommand();
                if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                    this.props.afterEditTask(this.currentEditedData);
                }
            }
            this.closeCommand = swapClose;
            this.setStateHelper(stateSalin => {
                stateSalin.editorState = "view";
                stateSalin.bannerMessages.push(this.taskAfterSaveAddSuccessGenerateBannerMessage(data));
                this.taskAfterAddDone(data, stateSalin);
                return stateSalin;
            }, () => {
                this.applyDataToControls(this.state.currentEditedData);
            });
        }


    }


    /**
     * generator message untuk banner message. kalau memerlukan message yang berbeda, ini yang harus di override
     */
    taskAfterSaveEditSuccessGenerateBannerMessage(data: DATA): ReactEditorBannerMessage {
        return {
            type: 'error',
            title: "Simpan selesai",
            message: "Data sukses di simpan, berikut ini adalah detail dari data"
        };
    }

    /**
     * task setelah save edit selesai
     */
    taskAfterSaveEditSuccess(data: DATA) {
        let afterEdit: EditorBehaviorOnSaveDoneParameter = this.props.editorBehaviorOnSaveDoneParameter;
        if (isNull(afterEdit)) {
            afterEdit = {
                closeOnSaveSucess: false,
                closeDelay: 10
            }
        }
        if (afterEdit.closeOnSaveSucess) {
            this.props.closeCommand();
            if (!isNull(this.props.afterEditTask)) {
                this.props.afterEditTask(data);
            }
        } else {
            let swapClose: () => any = () => {
                this.props.closeCommand();
                if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                    this.props.afterEditTask(this.currentEditedData);
                }
            }
            this.closeCommand = swapClose;
            this.setStateHelper(slnState => {

                slnState.editorState = "view";
                slnState.bannerMessages.push(this.taskAfterSaveEditSuccessGenerateBannerMessage(data));
                this.taskAfterEditDone(data, slnState);
                return slnState;
            }, () => {
                this.applyDataToControls(this.state.currentEditedData);
            });


        }

    }

    /**
     * worker untuk save new data
     */
    saveAdd(saveCallback?: (data: DATA) => any, errorCallback?: (code: string, message: string, exc: any) => any): any {
        let bnrMessages: ReactEditorBannerMessage[] = [];
        let valRslt: CustomValidationFailureResult[] = this.validateMandatoryField();
        if (!isNull(valRslt) && valRslt.length > 0) {
            console.warn('Validasi mandatory gagal');
            bnrMessages = valRslt.map(vl => {
                let v: ReactEditorBannerMessage = {
                    type: 'error',
                    title: vl.erorrCode,
                    message: vl.errorMessage,
                    rawError: vl
                };
                return v;
            });
            this.setStateHelper(st => {
                st.bannerMessages = bnrMessages;
            }, CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => { }));
            return;
        }

        if (saveCallback == null || typeof saveCallback == 'undefined') {
            saveCallback = (data: DATA) => { };
        }
        if (errorCallback == null || typeof errorCallback != 'undefined') {
            errorCallback = (code: string, message: string, exc: any) => { };
        }




        this.setStateHelper(st1 => {
            st1.bannerMessages = [];
            st1.editingModeEnabled = false;
        }, () => {
            this.fetchDataFromControls(this.state.currentEditedData);
            let bnrContainer: any[] = [];
            if (!this.validateEditData(this.state.currentEditedData, bnrContainer)) {
                this.setStateHelper(st2 => {
                    st2.bannerMessages = bnrContainer;
                });
                return;
            }
            let addData: any = this.generateSaveAddParam();
            addData.token = this.state.editorDataToken;
            let addUrl: string = this.generateAddDataUrl();
            this.ajaxUtils.put(addUrl, addData)
                .then((dbData: DATA) => {
                    this.setStateHelper(st2 => {
                        ObjectUtils.copyField(dbData, st2.currentEditedData);
                    }, () => {
                        saveCallback(dbData);
                        this.taskAfterSaveAddSuccess(dbData);
                        CoreBaseDirectDbDrivenEditorPanel.SHOW_INFO_MESSAGE('Simpan berhasil',
                            "Data baru sukses di simpan, silakan lihat kembali detail data untuk dari database",
                            () => {

                            });
                    });

                }).catch((exc: any) => {
                    this.onSaveDataFailure(exc);
                });
        })












    }


    /**
     * handler kalau save gagal . override ini kalau proses gagal
     * @param exc error data
     */
    onSaveDataFailure(exc: any) {
        let code: string = exc.errorCode;
        let message: string = exc.message;
        CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE(message, code, exc, () => {
            console.error('[CoreBaseDirectDbDrivenEditorPanel]Gagal memproses save data , error : ', exc);
            this.setStateHelper(st => {
                st.bannerMessages.push({
                    type: 'error',
                    title: code,
                    message: message
                });
            });


            if (code != "INVALID_TOKEN") {
                this.requestEditDataToken(tkn => {
                    this.setStateHelper(st => {
                        st.editingModeEnabled = true;
                        st.editorDataToken = tkn;
                    });
                }, (code: string, message: string, ex: any) => {
                    console.error('[CoreBaseDirectDbDrivenEditorPanel]Gagal request token , error ==> code', code, '. message : ', message, '.raw error : ', ex);
                    this.setStateHelper(st => {
                        st.editingModeEnabled = true;
                        if (isNull(st.bannerMessages)) {
                            st.bannerMessages = [];
                        }
                        st.bannerMessages.push({
                            type: 'error',
                            title: "TOKEN_NOT_AVAILABLE",
                            message: "Token Untuk edit tidak bisa di request(error : ) + " + message + ",data tidak bisa di simpan kembali. silakan di ulangi kembali"
                        });
                    });
                });

            }
        });
    }


    saveAddPutWorker(): Promise<any> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc) => any) => {

        });

    }

    /**
     * worker kalau add new data sudah di lakukan
     */
    taskAfterAddDone(data: DATA, targetState: STATE) {
        ObjectUtils.copyOnlyPrimitiveFields(data, targetState.currentEditedData);
    }
    /**
     * task untuk edit done handler
     */
    taskAfterEditDone(data: DATA, targetState: STATE) {
        ObjectUtils.copyOnlyPrimitiveFields(data, targetState.currentEditedData);
    }
    /**
     * task setelah add done
     */
    taskAfterEraseDone(data: DATA) {

    }


    /**
     * generator parameter untuk update
     */
    generateSaveUpdateParam(): any {
        return {
            data: this.state.currentEditedData,
            token: this.state.editorDataToken,
            pojo: this.getModelName(),
            fields: this.getUpdateAbleFields()
        };
    }




    __saveEditWorker(saveCallback: (data: DATA) => any, errorCallback: (code: string, message: string, exc: any) => any): Promise<any> {
        return new Promise<any>(async (accept: any, reject: any) => {
            let param: any = this.generateSaveUpdateParam();
            param.token = this.state.editorDataToken;
            let saveUrl: string = this.generateUpdateDataUrl();
            let dbData: DATA = null;
            try {
                dbData = await this.ajaxUtils.put(saveUrl, param);
                saveCallback(dbData);
                this.taskAfterSaveEditSuccess(dbData);
                accept(dbData);
            } catch (exc) {
                let code: string = exc.errorCode;
                let message: string = exc.message;
                CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE(code, message, exc, () => {
                    this.setStateHelper(st => {
                        st.bannerMessages.push({
                            type: 'error',
                            title: code,
                            message: message
                        });
                    });
                });
                if (code != "INVALID_TOKEN") {
                    this.requestEditDataTokenFacade(this.getDataIdAsString(this.state.currentEditedData)).then(d => { }).catch(exc => { });
                }
                reject(exc);

            }



        });
    }

    /**
     * worker untuk save edit data
     */
    saveEdit(saveCallback?: (data: DATA) => any, errorCallback?: (code: string, message: string, exc: any) => any) {

        let bnrMessages: ReactEditorBannerMessage[] = [];
        let valRslt: CustomValidationFailureResult[] = this.validateMandatoryField();
        if (!isNull(valRslt) && valRslt.length > 0) {
            console.warn('Validasi mandatory gagal');
            bnrMessages = valRslt.map(vl => {
                let v: ReactEditorBannerMessage = {
                    type: 'error',
                    title: vl.erorrCode,
                    message: vl.errorMessage,
                    rawError: vl
                };
                return v;
            });
            this.setStateHelper(st => {
                st.bannerMessages = bnrMessages;
            }, CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => { }));
            return;
        }

        if (saveCallback == null || typeof saveCallback != 'undefined') {
            saveCallback = (data: DATA) => { };
        }
        if (errorCallback == null || typeof errorCallback != 'undefined') {
            errorCallback = (code: string, message: string, exc: any) => { };
        }

        this.fetchDataFromControls(this.state.currentEditedData);
        this.setStateHelper(st => {
            st.bannerMessages = [];
            st.editingModeEnabled = false;
            if (!this.validateEditData(st.currentEditedData, st.bannerMessages)) {
                return;
            }
        });
        this.__saveEditWorker(saveCallback, errorCallback)
            .then(d => {
                console.info('[CoreBaseDirectDbDrivenEditorPanel] Data sukeses di simpan : ', d);
            })
            .catch(exc => {
                console.error('[CoreBaseDirectDbDrivenEditorPanel] Gagal memproses simpan data, error : ', exc);
            })





    }


    /**
     * view data detail
     * @param id id dari data untuk di view
     * @param closeCommand comman untuk close panel. bagaimana cara hide panel
     * @param onDataLoadedTask handler kalau data sudah di load. lakukan yang di perlukan untuk handler task berikut
     */
    viewData(id: ID, onDataLoadedTask?: (data: DATA) => any) {
        let actualParamArrayTask: AdditionalEditorTask<DATA>[] = this.additionalOnViewTaskHandlers;
        if (onDataLoadedTask != null && typeof onDataLoadedTask !== "undefined") {
            if (actualParamArrayTask == null || typeof actualParamArrayTask === "undefined") {
                actualParamArrayTask = [onDataLoadedTask];
            } else {
                actualParamArrayTask = [onDataLoadedTask];
                for (var x of this.additionalOnViewTaskHandlers) {
                    actualParamArrayTask.push(x);
                }
            }
        }
        this.requestDataForEdit(id, 'view', actualParamArrayTask, this.dataNotFoundOnDeleteHandler);
    }


    /**
     * date fields. ini untuk fix data
     */
    getDateFields(): string[] {
        return [];
    }




}