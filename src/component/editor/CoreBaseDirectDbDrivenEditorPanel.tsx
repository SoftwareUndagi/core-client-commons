// import * as React from "react";
import { ReactEditorBannerMessage } from './EditorComponent';
import { CoreBaseReactEditorPanel, CoreBaseReactEditorPanelState } from "./CoreBaseReactEditorPanel";
import { AdditionalEditorTask } from './EditorComponentData';
import { isNull, ObjectUtils, CommonLookupValue, EditDataWrapper, LookupRequestResultWrapper, IncludeModelParam, LookupWithToken, LookupWithTokenResponse, LookupRequestData } from 'base-commons-module';
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
    editorBehaviorOnSaveDoneParameter?: EditorBehaviorOnSaveDoneParameter;

    /**
     * task yang akan di run efektif setelah data selesai di simpan(add / edit/delete)
     */
    taskAfterDataSaved?: (data: DATA) => any;

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

    constructor(props: PROP) {
        super(props);
        this.additionalOnAddTaskHandlers = [];
        this.additionalOnAddTaskHandlers.push((d) => { this.additionalTaskOnAdd(d); });
        this.additionalOnEraseTaskHandlers = [];
        this.additionalOnEraseTaskHandlers.push((d2) => { this.additionalTaskOnErase(d2); });
        this.additionalOnEditTaskHandlers = [];
        this.additionalOnEditTaskHandlers.push((d2) => { this.additionalTaskOnedit(d2); });
        this.additionalOnViewTaskHandlers = [];
        this.additionalOnViewTaskHandlers.push((d2) => { this.additionalTaskOnView(d2); });
        this.dataNotFoundOnDeleteHandler = (notFoundFlag: boolean) => {
            console.warn('Data not found handler belum di siapkan untuk elemen ini , isikan method : dataNotFoundOnDeleteHandler');
        };
        let swapState: any = this.state;
        swapState.editingModeEnabled = true;
        swapState.bannerMessages = [];
        swapState.editingModeEnabled = true;
        // register child
        this.additionalOnAddTaskHandlers.push((d: DATA) => {
            this.subEditorHandlers.forEach(suEditor => {
                suEditor.additionalTaskOnAdd(d);
            });
        });
        this.additionalOnEraseTaskHandlers.push((d: DATA) => {
            this.subEditorHandlers.forEach(suEditor => {
                suEditor.additionalTaskOnDelete(d);
            });
        });
        this.additionalOnEditTaskHandlers.push((d: DATA) => {
            this.subEditorHandlers.forEach(suEditor => {
                suEditor.additionalTaskOnEdit(d);
            });
        });
        this.additionalOnViewTaskHandlers.push((d: DATA) => {
            this.subEditorHandlers.forEach(suEditor => {
                suEditor.additionalTaskOnView(d);
            });
        });

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
        let n: any = null;
        if (this.state == null || typeof this.state === 'undefined') {
            return n;
        }
        return this.state.editorState;
    }
    /**
     * task tambahan saat lookup di terima
     * @param lookups data lookup dari cache atau server
     * @param targetState state tujuan anda perlu menyalin, tidak perlu set state
     */
    additionalTaskOnLookupRecieved(targetState: STATE, lookups: { [id: string]: CommonLookupValue[] }) {
        //
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
    additionalTaskOnMount() {
        //
    }
    componentWillMount() {
        this.closeCommand = this.props.closeCommand;
        console.log('[CoreBaseDirectDbDrivenEditorPanel]Component mount : ', this.props);
        let stateData: any = { editorState: this.props.editorState };
        if (this.props.editorState === 'edit' || this.props.editorState === 'view' || this.props.editorState === 'delete') {
            // this.state.
            stateData.id = this.props.dataIdToEdit;
        } else if (this.props.editorState === 'add') {
            // this.state.currentEditedData
            // stateData.currentEditedData = this.props.dataForAddNew ;

        }
        let swapState: any = this.state;
        Object.keys(stateData).forEach(k => {
            swapState[k] = stateData[k];
        });
        this.additionalTaskOnMount();
    }
    componentDidMount() {
        let doNotCall: boolean = this.props.doNotCallEditorOnInit!;
        if (isNull(doNotCall)) {
            doNotCall = false;
        }
        if (!doNotCall) {
            if (this.props.editorState === 'add') {
                let sDtBaru: any = this.props.dataForAddNew;
                this.addNewData(sDtBaru);
            } else if (this.props.editorState === 'edit') {
                let sDtEdit: any = this.props.dataIdToEdit;
                this.editData(sDtEdit);
            } else if (this.props.editorState === 'view') {
                let sDtView: any = this.props.dataIdToEdit;
                this.viewData(sDtView);
            } else if (this.props.editorState === 'delete') {
                let sDtView: any = this.props.dataIdToEdit;
                this.deleteConfirmation(sDtView);
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
    close: () => any = () => {
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
    getIncludeModels(): IncludeModelParam[] {
        let s: any = null;
        return s;
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
        let s: any = null;
        return s;
    }

    /**
     * memaksa lookup manager untuk reload
     */
    requestLookupReload() {
        if (this.lookupManager.getLookupIds().length > 0) {
            let s: any = null;
            let lookupParam: LookupWithToken = {
                dataIdAsString: s,
                modelName: this.getModelName(),
                onTokenAccepted: (token: string) => {
                    //
                },
                onLookupAccepted: (lookups) => {
                    //
                }
            };
            this.lookupManager.requestLookupData(lookupParam);
        }
    }

    requestLookupReloadWithPromise(): Promise<any> {
        let s: any = null;
        if (this.lookupManager.getLookupIds().length === 0) {
            return new Promise<any>((accept: (n: any) => any) => {
                accept({});
            });
        }
        return this.lookupManager.requestLookupDataWithPromise({
            dataIdAsString: s,
            modelName: this.getModelName(),
            onTokenAccepted: (token: string) => {
                if (!isNull(token) && token !== this.state.editorDataToken) {
                    this.setStateHelper(st => {
                        st.editorDataToken = token;
                    });
                }
            },
            onLookupAccepted: (indexedLookup: { [id: string]: CommonLookupValue[] }) => {
                if (!isNull(indexedLookup)) {
                    let keys: string[] = Object.keys(indexedLookup);
                    if (keys.length > 0) {
                        this.setStateHelper(st => {
                            if (isNull(st.lookups)) {
                                st.lookups = {};
                            }
                        });
                    }
                }

            }
        });

    }

    /**
     * worker untuk membuat data
     */
    addNewData(newData: DATA): Promise<any> {
        let s: any = null;
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            let completionTaskAndDoAccept: () => any = () => {
                setTimeout(
                    () => {
                        this.applyDataToControls(newData);
                        for (var addHdlr of this.additionalOnAddTaskHandlers) {
                            addHdlr(newData);
                        }
                    },
                    200);
                accept({});
            };
            this.setStateHelper(st => {
                st.editorState = 'none';
                st.editingModeEnabled = false ; 
            });
            let ids: string[] = this.lookupManager.getLookupIds();
            if (!this.lovRequested && !isNull(ids) && ids.length > 0) {
                console.log('[CoreBaseDirectDbDrivenEditorPanel] request data dengan lookup : ', ids.join(','));
                this.lovRequested = true;
                this.lookupManager.requestLookupDataWithPromise({
                    lookupIds: ids,
                    modelName: this.getModelName(),
                    onTokenAccepted: (tkn: string) => {
                        //
                    },
                    onLookupAccepted: (indexedLookup: { [id: string]: CommonLookupValue[] }) => {
                        //
                    }
                }).then((d: LookupWithTokenResponse) => {
                    this.setStateHelperAsync(
                        sln => {
                            sln.editorDataToken = d.token;
                            if (isNull(sln.lookups)) {
                                sln.lookups = {};
                            }
                            if (d.lookups) {
                                let keys: string[] = Object.keys(d.lookups);
                                for (let k of keys) {
                                    sln.lookups![k] = d.lookups[k];
                                }
                            }
                            this.additionalTaskOnLookupRecieved(sln, d.lookups);
                            sln.currentEditedData = newData;
                            sln.editingModeEnabled = true ; 
                            sln.editorState = 'add';
                            sln.id = s;

                        }).then(completionTaskAndDoAccept) ;
                }).catch(reject);
            } else {
                this.requestEditDataTokenWithPromise(s).then(token => {
                    this.setStateHelper(
                        sln => {
                            sln.editorDataToken = token;
                            sln.currentEditedData = newData;
                            sln.editorState = 'add';
                            sln.editingModeEnabled = true ; 
                            sln.id = s;
                        },
                        () => {
                            completionTaskAndDoAccept();
                        });
                }).catch(reject);
            }
        });
    }
    /**
     * request token dan langsung update token di editor
     */
    requestAndUpdateToken() {
        let s: any = null;
        let id: string = s;
        if (['edit', 'delete'].indexOf(this.state.editorState) >= 0) {
            id = this.getDataIdAsString(this.state.currentEditedData);
        }
        this.requestEditDataTokenWithPromise(id)
            .then(d => {
                this.setStateHelper(sln => {
                    sln.editorDataToken = d;
                });
            })
            .catch(exc => {
                console.error('[CoreBaseDirectDbDrivenEditorPanel] gagal request token, error : ', exc);
            });

    }

    /**
     * request token edit dari server. kalau erorr code bukan
     */
    requestEditDataTokenWithPromise(objectId: string): Promise<string> {
        return new Promise<string>((accept: (n: string) => any, reject: (exc: any) => any) => {
            let url: string = "/dynamics/rest-api/generic/" + this.getModelName() + "/double-submit-token-generator.svc";
            if (!isNull(objectId) && objectId.length > 0) {
                url += "?objectId=" + objectId;
            }
            this.ajaxUtils.get(url)
                .then(accept)
                .catch(reject);
        });
    }
    /**
     * request token sekaligus update token di editor
     * @param objectId 
     */
    requestEditDataTokenFacade(objectId: string): Promise<string> {
        return new Promise<string>((accept: (n: string) => any, reject: (exc: any) => any) => {
            this.requestEditDataTokenWithPromise(objectId)
                .then(d => {
                    this.setStateHelper(
                        st => {
                            st.editorDataToken = d;
                        },
                        () => {
                            accept(d);
                        });
                })
                .catch(exc => {
                    this.setStateHelper(
                        stExc => {
                            stExc.bannerMessages = [{
                                type: 'error',
                                title: "TOKEN_NOT_AVAILABLE",
                                message: "Token Untuk edit tidak bisa di request(error : ) + " + exc.message + ",data tidak bisa di simpan kembali. silakan di ulangi kembali"
                            }];
                        },
                        () => {
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
        if (!isNull(objectId) && objectId!.length > 0) {
            url += "?objectId=" + objectId;
        }
        self.ajaxUtils.sendAjaxGet(
            url,
            a => {
                let tkn: any = a;
                onSuccess(tkn);
            },
            onFailure);
    }

    /**
     * handler untuk menampilkan data dalam editor. worker untuk edit, view delete. ini bisa di pergunakan untuk 
     * @param editorState 
     * @param data 
     * @param targetState 
     */
    handlerForEditOrViewData(parameter: {
        /**
         * state dari editor
         */
        editorState: 'add' | 'edit' | 'delete' | 'view';
        /**
         * data untuk edi edit
         */
        data: DATA;
        /**
         * state tempat menaruh data
         */
        targetState?: STATE;

        /**
         * default = false, ini untuk menandai apakah tidak perlu request lookup atau tidak
         */
        doNotRequestLookup?: boolean;
    }) {
        let { targetState, doNotRequestLookup, data, editorState } = parameter;
        if (isNull(targetState)) {
            this.setStateHelper(st => {
                parameter.targetState = st;
                this.handlerForEditOrViewData(parameter);
            });
            return;
        }
        if (isNull(doNotRequestLookup) || !doNotRequestLookup) {
            this.requestLookupReload();
        }
        targetState!.currentEditedData = data;
        targetState!.editorState = editorState;
    }
    /**
     * view data detail
     * @param data data untuk di view
     * @param doNotRequestLookup default = false . ini untuk menandai untuk tidak 
     */
    viewDataWithSpecifiedData(parameter: {
        /**
         * data untuk di view
         */
        data: DATA;
        /**
         * flag untuk tidak me-load lookup
         */
        doNotRequestLookup?: boolean,
        /**
         * task tambahan dalam viewDataWithSpecifiedData. di trigger pada saat update state
         */
        viewDataWithSpecifiedDataAdditionalTask: (data: DATA, targetState: STATE) => any
    }): Promise<any> {
        return new Promise<any>((accept: (n: any) => any, reject: (n: any) => any) => {
            let { data, doNotRequestLookup } = parameter;
            doNotRequestLookup = doNotRequestLookup || false;
            let completeTask: any = () => {
                this.setStateHelper(
                    st => {
                        st.editorState = 'view';
                        st.currentEditedData = data;
                        st.bannerMessages = [];
                        if (!isNull(parameter.viewDataWithSpecifiedDataAdditionalTask)) {
                            parameter.viewDataWithSpecifiedDataAdditionalTask(data, st);
                        }
                    },
                    () => {
                        this.applyDataToControls(data);
                        accept({});
                    });
            };
            if (!doNotRequestLookup && !this.lovRequested) {
                this.requestLookupReloadWithPromise()
                    .then(d => {
                        completeTask();
                    }).catch(reject);
            } else {
                completeTask();
            }

        });
    }

    requestDataForEdit(dataID: ID, editorState: string, additionalEditTasks: AdditionalEditorTask<DATA>[], onDataNotFoundHandler: (notFoundFlag: boolean) => any): Promise<any> { 
        return new Promise<any>(async (accept: (n: any) => any , reject: (exc: any) => any  ) => {
            
            let lookupReqs: LookupRequestData[] = null! ; 
            if (!this.lovRequested &&  this.lookupManager.getLookupIds().length >  0) {
                lookupReqs = await this.lookupManager.loadFromCacheAndGenerateLookupRequestUsingPromiseAlias() ; 
            }
            let rslt: EditDataWrapper<DATA> = null! ; 
            try {
                rslt = await this.requestDataForEditViaAjaxWorker({ id: dataID, editorState: editorState as any, lookupRequestParams: lookupReqs })
            } catch ( exc ) {
                let predefinedHandler: boolean = await this.onReadDataForEditError(dataID , editorState , exc ) ; 
                if ( !predefinedHandler) {
                    this.setStateHelper( st => {
                        st.editorState = 'error'; 
                        let errorCode: string = exc.errorCode ; 
                        if ( !errorCode) {
                            errorCode = exc.code ; 
                        }
                        if ( !errorCode) { // kedua nya null, untuk code, di set dengan default
                            errorCode ='UNKNOWN_ERROR_READ_DATA' ; 
                        }
                        st.bannerMessages = [{
                            type: 'error' , 
                            title : errorCode , 
                            message: exc.message 
                        }] ; 
                    } , () => {
                        reject( exc ) ; // reject setelah di set state selesai
                    }); 
                } else {
                    reject( exc ) ; 
                }
                return ; 
            }
            if ( !rslt || !rslt.editedData) {
                let haveHandler: boolean = await this.onDataNotFound(dataID , editorState) ; 
                if ( haveHandler) {
                    accept({}); 
                    return ; 
                }
            } 
            await  this.editDataAcceptedHandler(dataID , editorState , rslt , additionalEditTasks) ; 
            accept(rslt); 
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
        this.setStateHelper(sln => { sln.bannerMessages = (isNull(messages) ? null : messages)!; });
    }

    /**
     * worker untuk delete data
     */
    saveDelete(saveCallback?: (data: DATA) => any, errorCallback?: (code: string, message: string, exc: any) => any): any {
        this.setStateHelper(
            st => {
                st.bannerMessages = [];
                st.editingModeEnabled = false;
            },
            () => {
                let idDataToEdit: string = this.getDataIdAsString(this.state.currentEditedData);
                let done: (affected: number) => any = (affected: number) => {
                    CoreBaseDirectDbDrivenEditorPanel.SHOW_INFO_MESSAGE(
                        'Hapus Berhasil', 'Data sukses di hapus. berikut ini adalah detail dari data',
                        () => {
                            this.close();
                            if (this.props.afterEditTask != null && typeof this.props.afterEditTask !== 'undefined') {
                                this.props.afterEditTask(this.currentEditedData);
                            }

                        });
                };
                let errHandler: (code: string, message: string, exc: any) => any = (code: string, message: string, exc: any) => {
                    CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE(
                        code, message, exc,
                        () => {
                            this.setStateHelper(
                                st => {
                                    st!.bannerMessages!.push({
                                        type: 'error',
                                        title: code,
                                        message: message
                                    });
                                },
                                () => {
                                    this.taskAfterEraseDone(this.state.currentEditedData);
                                });
                        });
                };
                if (this.deleteAjaxMethodName === 'sendAjaxDelete') {
                    this.ajaxUtils.sendAjaxDelete(
                        this.generateDeleteUrl(idDataToEdit),
                        done, errHandler
                    );
                } else if (this.deleteAjaxMethodName === 'sendAjaxPost') {
                    let delParam: any = this.generateSaveDeleteParam();
                    delParam.token = this.state.editorDataToken;
                    this.ajaxUtils.sendAjaxPost(
                        this.generateDeleteUrl(idDataToEdit), delParam,
                        done, errHandler
                    );
                } else if ('sendAjaxPut' === this.deleteAjaxMethodName) {
                    let delParam: any = this.generateSaveDeleteParam();
                    delParam.token = this.state.editorDataToken;
                    this.ajaxUtils.sendAjaxPut(
                        this.generateDeleteUrl(idDataToEdit), delParam,
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
            type: 'info',
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
        };
        if (!isNull(this.props.editorBehaviorOnSaveDoneParameter)) {
            dummyParam = this.props.editorBehaviorOnSaveDoneParameter!;
        }

        if (dummyParam.closeOnSaveSucess) {
            if (isNull(dummyParam.closeDelay) || dummyParam.closeDelay === 0) {
                dummyParam.closeDelay = 2000;
            }
            setTimeout(
                () => {
                    this.props.closeCommand();
                    if (!isNull(this.props.afterEditTask)) {
                        this.props.afterEditTask(data);
                    }
                },
                dummyParam.closeDelay);
        } else {
            let swapClose: () => any = () => {
                this.props.closeCommand();
                if (this.props.afterEditTask != null && typeof this.props.afterEditTask !== 'undefined') {
                    this.props.afterEditTask(this.currentEditedData);
                }
            };
            this.closeCommand = swapClose;
            this.setStateHelper(
                stateSalin => {
                    stateSalin.editorState = "view";
                    stateSalin!.bannerMessages!.push(this.taskAfterSaveAddSuccessGenerateBannerMessage(data));
                    this.taskAfterAddDone(data, stateSalin);
                    return stateSalin;
                },
                () => {
                    this.applyDataToControls(this.state.currentEditedData);
                });
        }
    }
    /**
     * generator message untuk banner message. kalau memerlukan message yang berbeda, ini yang harus di override
     */
    taskAfterSaveEditSuccessGenerateBannerMessage(data: DATA): ReactEditorBannerMessage {
        return {
            type: 'info',
            title: "Simpan selesai",
            message: "Data sukses di simpan, berikut ini adalah detail dari data"
        };
    }

    /**
     * task setelah save edit selesai
     */
    taskAfterSaveEditSuccess(data: DATA) {
        let afterEdit: EditorBehaviorOnSaveDoneParameter = this.props.editorBehaviorOnSaveDoneParameter!;
        if (isNull(afterEdit)) {
            afterEdit = {
                closeOnSaveSucess: false,
                closeDelay: 10
            };
        }
        if (afterEdit.closeOnSaveSucess) {
            this.props.closeCommand();
            if (!isNull(this.props.afterEditTask)) {
                this.props.afterEditTask(data);
            }
        } else {
            let swapClose: () => any = () => {
                this.props.closeCommand();
                if (this.props.afterEditTask != null && typeof this.props.afterEditTask !== 'undefined') {
                    this.props.afterEditTask(this.currentEditedData);
                }
            };
            this.closeCommand = swapClose;
            this.setStateHelper(
                slnState => {
                    slnState.editorState = "view";
                    slnState!.bannerMessages!.push(this.taskAfterSaveEditSuccessGenerateBannerMessage(data));
                    this.taskAfterEditDone(data, slnState);
                    return slnState;
                },
                () => {
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
            this.setStateHelper(
                st => {
                    st.bannerMessages = bnrMessages;
                },
                CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => {
                    //
                }));
            return;
        }

        if (saveCallback == null || typeof saveCallback === 'undefined') {
            saveCallback = (data: DATA) => {
                //
                console.warn('Save callback masih memakai bawaan, tidak ada handler sama sekali');
            };
        }
        if (errorCallback == null || typeof errorCallback === 'undefined') {
            errorCallback = (code: string, message: string, exc: any) => {
                //
                console.warn('error callback blm di handle. masih mempergunakan default');
            };
        }
        this.setStateHelper(
            st1 => {
                st1.bannerMessages = [];
                st1.editingModeEnabled = false;
            },
            () => {
                this.fetchDataFromControls(this.state.currentEditedData);
                let bnrContainer: any[] = [];
                if (!this.validateEditData(this.state.currentEditedData, bnrContainer)) {
                    this.setStateHelper(st2 => {
                        st2.bannerMessages = bnrContainer;
                        st2.editingModeEnabled = true;
                    });
                    return;
                }
                let addData: any = this.generateSaveAddParam();
                addData.token = this.state.editorDataToken;
                let addUrl: string = this.generateAddDataUrl();
                this.ajaxUtils.put(addUrl, addData)
                    .then((dbData: DATA) => {
                        this.setStateHelper(
                            st2 => {
                                ObjectUtils.copyField(dbData, st2.currentEditedData);
                            },
                            () => {
                                saveCallback!(dbData);
                                this.taskAfterSaveAddSuccess(dbData);
                                CoreBaseDirectDbDrivenEditorPanel.SHOW_INFO_MESSAGE(
                                    'Simpan berhasil',
                                    "Data baru sukses di simpan, silakan lihat kembali detail data untuk dari database",
                                    () => {
                                        //
                                    });
                                if (!isNull(this.props.taskAfterDataSaved)) {
                                    this.props.taskAfterDataSaved!(dbData);
                                }
                            });

                    }).catch((exc: any) => {
                        this.onSaveDataFailure(exc);
                    });
            });

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
                st.bannerMessages!.push({
                    type: 'error',
                    title: code,
                    message: message
                });
            });
            if (code !== "INVALID_TOKEN") {
                this.requestEditDataToken(
                    tkn => {
                        this.setStateHelper(st => {
                            st.editingModeEnabled = true;
                            st.editorDataToken = tkn;
                        });
                    },
                    (codeErrorToken: string, messageErrorToken: string, ex: any) => {
                        console.error('[CoreBaseDirectDbDrivenEditorPanel]Gagal request token , error ==> code', code, '. message : ', messageErrorToken, '.raw error : ', ex);
                        this.setStateHelper(st => {
                            st.editingModeEnabled = true;
                            if (isNull(st.bannerMessages)) {
                                st.bannerMessages = [];
                            }
                            st.bannerMessages!.push({
                                type: 'error',
                                title: "TOKEN_NOT_AVAILABLE",
                                message: "Token Untuk edit tidak bisa di request(error : ) + " + messageErrorToken + ",data tidak bisa di simpan kembali. silakan di ulangi kembali"
                            });
                        });
                    });

            }
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
        //
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
        // let sNull: any = null ;
        return new Promise<any>((accept: any, reject: any) => {
            let param: any = this.generateSaveUpdateParam();
            param.token = this.state.editorDataToken;
            let saveUrl: string = this.generateUpdateDataUrl();
            // let dbData: DATA = sNull;
            this.ajaxUtils.put(saveUrl, param)
                .then((dbDataAfterPut: DATA) => {
                    saveCallback(dbDataAfterPut);
                    this.taskAfterSaveEditSuccess(dbDataAfterPut);
                    accept(dbDataAfterPut);
                    if (!isNull(this.props.taskAfterDataSaved)) {
                        this.props.taskAfterDataSaved!(dbDataAfterPut);
                    }
                })
                .catch(exc => {
                    let code: string = exc.errorCode;
                    let message: string = exc.message;
                    CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE(code, message, exc, () => {
                        this.setStateHelper(st => {
                            st.bannerMessages!.push({
                                type: 'error',
                                title: code,
                                message: message
                            });
                        });
                    });
                    if (code !== "INVALID_TOKEN") {
                        this.requestEditDataTokenFacade(this.getDataIdAsString(this.state.currentEditedData)).then(d => {
                            //
                        }).catch(excInvalidToken => {
                            //
                            console.error('Error invalid token detail : ', excInvalidToken);
                        });
                    }
                    reject(exc);
                });
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
            this.setStateHelper(
                st => {
                    st.bannerMessages = bnrMessages;
                },
                CoreBaseDirectDbDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => {
                    //
                }));
            return;
        }

        if (saveCallback == null || typeof saveCallback !== 'undefined') {
            saveCallback = (data: DATA) => {
                //
            };
        }
        if (errorCallback == null || typeof errorCallback !== 'undefined') {
            errorCallback = (code: string, message: string, exc: any) => {
                //
            };
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
            });
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
    /**
     * request data dari ajax. kalau perlu dedicated ajax request, bisa dengan ini
     */
    protected requestDataForEditViaAjaxWorker(parameter: {
        /**
         * id dari data untuk di request
         */
        id: ID;
        /**
         * mode editor pada saat request.misal kalau edit + delete berarti akan menyertakan token
         */
        editorState: 'edit' | 'delete' | 'view';
        /**
         * lookup 
         */
        lookupRequestParams: LookupRequestData[]
    }): Promise<EditDataWrapper<DATA>> {
        let { id, editorState, lookupRequestParams } = parameter;
        let url: string = this.generateGetDataUrl(this.getModelName(), id);
        let incs: IncludeModelParam[] = this.getIncludeModels() || null;
        if (incs != null && incs.length > 0) {
            url += "&includedModels=" + btoa(JSON.stringify(incs));
        }
        if (editorState === "view") {
            url = url + "&includeToken=N";
        } else {
            url = url + "&includeToken=Y";
        }
        if (lookupRequestParams && lookupRequestParams.length > 0) {
            url = url + "&lookupFields=" + btoa(JSON.stringify(lookupRequestParams))
        }
        return this.ajaxUtils.get(url) as any;

    }
    /**
     * worker untuk memproses data lookup. ini untuk update lookup dalam state container, misal kalau ada update dari server untuk data lookup
     * @param targetState state target update, ini di dapat dari setStateHelper
     * @param lookups data update lookups
     */
    protected processReceivedLookupData: (targetState: STATE, lookups: LookupRequestResultWrapper[]) => any = (targetState: STATE, lookups: LookupRequestResultWrapper[]) => {
        if (!lookups || lookups.length === 0) {
            return;
        }
        let updatedCached: { [id: string]: CommonLookupValue[] } = this.lookupManager.processLookupRequestResult(lookups);
        if (!targetState.lookups) {
            targetState.lookups = {};
        }
        ObjectUtils.copyField(updatedCached, targetState.lookups);
        this.additionalTaskOnLookupRecieved(targetState, targetState.lookups!);
    };

    /**
     * handler kalau data di terima
     * @param editData data untuk editor
     * @param additionalEditTasks task after edit
     */
    protected editDataAcceptedHandler(dataID: ID, editorState: string, editData: EditDataWrapper<DATA>, additionalEditTasks: AdditionalEditorTask<DATA>[]): Promise<any> {
        return new Promise<any>((accept: (n: any) => any, reject: (n: any) => any) => {
            this.setStateHelper(
                targetSate => {
                    targetSate.editorState = editorState;
                    targetSate.id = dataID;
                    if(editData){
                        this.processReceivedLookupData(targetSate, editData.lookups!);
                        targetSate.currentEditedData = editData.editedData!;
                        targetSate.editorDataToken = editData.editDataToken;
                    }
                    
                },
                () => {
                    let dt: any = editData ? editData.editedData! : null ; 
                    this.applyDataToControls(dt);
                    for (var xxEdit of additionalEditTasks) {
                        xxEdit(dt);
                    }
                    accept({});
                });
        });

    };
    /**
     * handler kalau data tidak di temukan. kalau misal return false , berarti akan di run default pada saat data not found
     * @param dataID 
     * @param editorState 
     */
    protected onDataNotFound(dataID: ID, editorState: string): Promise<boolean>{
        return Promise.resolve(false) ;
    }

    /**
     * handler kalau read data ada error di server
     * @param dataID id dari data yang di request
     * @param editorState state dari edit yang di request
     * @param exception raw exception, error dalam baca data
     * @return false kalau tidak di handle sama sekali oleh handler, artinya built in akan di panggil
     */
    protected onReadDataForEditError( dataID: ID, editorState: string, exception: any  ): Promise<boolean> {
        return Promise.resolve(false) ;
    }


}