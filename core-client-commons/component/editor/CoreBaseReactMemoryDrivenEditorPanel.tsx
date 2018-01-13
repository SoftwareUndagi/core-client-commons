import * as React from "react";
import { ReactEditorBannerMessage } from './EditorComponent';
import { CoreBaseSubEditorPanel, CoreBaseSubEditorPanelProps, CoreBaseSubEditorPanelState } from "./CoreBaseSubEditorPanel";
import { CoreBaseReactEditorPanel, CoreBaseReactEditorPanelState } from './CoreBaseReactEditorPanel';
import { CommonCommunicationData } from "../../shared/index";
import { cloneObject, isNull } from '../../utils/index';
import { CustomValidationFailureResult } from "./CommonsInputElement";
import { ClientSideEditorContainer } from './ClientSideEditorContainer';


export interface CoreBaseReactMemoryDrivenEditorPanelState<DATA> extends CoreBaseReactEditorPanelState<DATA> {
    /**
     * banner message. untuk error message
     */
    messageContainers: ReactEditorBannerMessage[];
}
export interface CoreBaseReactMemoryDrivenEditorPanelProps<DATA> {
    /**
     * data container. untuk update data
     */
    dataContainer: ClientSideEditorContainer<DATA>;



    /**
     * task handler setelah variable di edit
     */
    afterEditTask: (data: DATA, editorState: string) => any;
    /**
     * command untuk close panel
     */
    closeCommand: () => any;
}


/**
 * base class untuk memory driven data
 */
export abstract class CoreBaseReactMemoryDrivenEditorPanel<DATA, PROPS extends CoreBaseReactMemoryDrivenEditorPanelProps<DATA>, STATE extends CoreBaseReactMemoryDrivenEditorPanelState<DATA>> extends CoreBaseReactEditorPanel<DATA, PROPS, STATE> {

    /**
     * submit handler. 
     */
    defaultSubmitHandler: (evt: any) => boolean;




    constructor(props: PROPS) {
        super(props);

        this.defaultSubmitHandler = (evt: any): boolean => {
            evt.preventDefault();
            if (this.state.editorState == 'add') {
                this.saveDataTaskAdd();
            } else if (this.state.editorState == 'edit') {
                this.saveDataTaskEdit()
            } else if (this.state.editorState == 'delete') {
                this.saveDataTaskDelete();
            }
            return false;
        }
    }

    saveDataTaskDelete() {
        let msg: ReactEditorBannerMessage[] = [];
        this.fetchDataFromControls(this.currentEditedData);
        if (!this.additionalValidationDeleteData(msg)) {
            this.setStateHelper(st => {
                if (isNull(st.messageContainers)) {
                    st.messageContainers = [];
                }
                st.messageContainers.push(...msg);

            });
            return false;
        }
        this.props.dataContainer.deleteData(this.state.currentEditedData);
        this.props.closeCommand();
        if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
            this.props.afterEditTask(this.currentEditedData, 'delete');
        }
    }
    /**
     * handler untuk save edit
     */
    saveDataTaskEdit() {
        this.saveDataTaskEditWorker().then( d=>{}).catch( exc=>{
            console.error('[CoreBaseReactMemoryDrivenEditorPanel#saveDataTaskEdit] gagal memanggil save data(add) error : ' , exc ) ; 
        }); 
        /*
        this.setStateHelper(st => {
            st.messageContainers = [];
        }, () => {
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
                    st.messageContainers = bnrMessages;
                }, CoreBaseReactMemoryDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => { }));
                return;
            }
            this.setStateHelper(st => {
                this.fetchDataFromControls(st.currentEditedData);
            }, () => {

                let msgs: ReactEditorBannerMessage[] = [];
                if (!this.additionalValidationEditData(msgs)) {
                    this.setStateHelper(st => {
                        if (isNull(st.messageContainers)) {
                            st.messageContainers = [];
                        }
                        st.messageContainers.push(...msgs);
                    });
                    return false;
                }
                this.props.dataContainer.editData(this.state.currentEditedData);
                this.props.closeCommand();
                if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                    this.props.afterEditTask(this.currentEditedData, 'edit');
                }
            });
        });*/

    }
    /**
     * task untuk handler add
     */
    saveDataTaskAdd() {
        this.saveDataTaskAddWorker().then( d=>{}).catch( exc=>{
            console.error('[CoreBaseReactMemoryDrivenEditorPanel#saveDataTaskAdd] gagal memanggil save data(add) error : ' , exc ) ; 
        }); 
        /*
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
                st.messageContainers = bnrMessages;
            }, CoreBaseReactMemoryDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => { }));
            return;
        }
        this.setStateHelper(st => {
            this.fetchDataFromControls(st.currentEditedData);
        }, () => {
            let msgs: ReactEditorBannerMessage[] = [];
            if (!this.additionalValidationAddData(msgs)) {
                this.setStateHelper(st => {
                    if (isNull(st.messageContainers)) {
                        st.messageContainers = [];
                    }
                    st.messageContainers.push(...msgs);
                });
                return false;
            }
            this.props.dataContainer.appendNewData(this.state.currentEditedData);
            this.props.closeCommand();
            if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                this.props.afterEditTask(this.currentEditedData, 'add');
            }
        });*/
    }





    /**
     * pindahan dari saveDataTaskEdit dibuat async, agar code lebih liner
     */
    protected saveDataTaskEditWorker () : Promise<boolean> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            await this.setStateHelperAsync (st => {
                st.messageContainers = [];
            }); 
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
                await this.setStateHelperAsync(st => {
                    st.messageContainers = bnrMessages;
                });
                accept(false) ; 
                CoreBaseReactMemoryDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => { }); 
                return;
            }
            await this.setStateHelper(st => {
                this.fetchDataFromControls(st.currentEditedData);
            }); 
            let msgs: ReactEditorBannerMessage[] = [];
            if (!this.additionalValidationEditData(msgs)) {
                 this.setStateHelper(st => {
                    if (isNull(st.messageContainers)) {
                        st.messageContainers = [];
                    }
                    st.messageContainers.push(...msgs);
                });
                accept(false) ;
                return ; 
            }
            this.props.dataContainer.editData(this.state.currentEditedData);
            this.props.closeCommand();
            if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                this.props.afterEditTask(this.currentEditedData, 'edit');
            }
            accept(true) ; 

        });

    }

    /**
     * worker untuk save add. di buat async agar bisa utilize method : setStateHelperAsync
     */
    protected saveDataTaskAddWorker(): Promise<boolean> {
        return new Promise<any>(async (accept: (n: any) => any, reject: (exc: any) => any) => {
            let bnrMessages: ReactEditorBannerMessage[] = [];
            await this.setStateHelperAsync(st=> st.messageContainers=[]); 
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
                await this.setStateHelperAsync(st => {
                    st.messageContainers = bnrMessages;
                });
                CoreBaseReactMemoryDrivenEditorPanel.SHOW_ERROR_MESSAGE('VALIDATION_FAILED', 'Save data not allowed, some field validation is failed.', {}, () => { })
                accept(false); 
                return;
            }
            await this.setStateHelperAsync(st => { this.fetchDataFromControls(st.currentEditedData);}) ; 
            let msgs: ReactEditorBannerMessage[] = [];
            if (!this.additionalValidationAddData(msgs)) {
                await this.setStateHelperAsync(st => {
                    if (isNull(st.messageContainers)) {
                        st.messageContainers = [];
                    }
                    st.messageContainers.push(...msgs);
                });
                accept(false)
                return ;
            }
            // all check clear
            this.props.dataContainer.appendNewData(this.state.currentEditedData);
            this.props.closeCommand();
            if (this.props.afterEditTask != null && typeof this.props.afterEditTask != 'undefined') {
                this.props.afterEditTask(this.currentEditedData, 'add');
            }
            accept(true) ; 
        });
    }


    /**
     * data yang sedang di edit
     */
    get currentEditedData(): DATA {
        return this.state.currentEditedData;
    }
    /**
     * state dari editor
     */
    get editorState(): string {
        return this.state.editorState;
    }
    componentWillMount() {

    }






    /**
     * taks sebelum data di render , dalam state delete data confirmation
     * @param data data utnuk konfirmasi delete
     */
    taskOnDeleteBeforeDataRendered(data: DATA): any {

    }


    /**
     * taks sebelum data di render , dalam state edit data
     * @param data data untuk di edit
     */
    taskOnEditBeforeDataRendered(data: DATA): any {

    }


    /**
     * taks sebelum data di render , dalam state view data
     * @param data data untuk di view
     */
    taskOnViewBeforeDataRendered(data: DATA): any {

    }


    /**
     * taks sebelum data di render , dalam state add
     * @param data data untuk di add
     */
    taskOnAddBeforeDataRendered(data: DATA): any {

    }

    /**
     * tambah data baru
     */
    deleteDataConfirmation(data: DATA) {
        this.setStateHelper(st => {
            st.currentEditedData = data;
            st.editorState = 'delete';
        }, () => {
            this.taskOnDeleteBeforeDataRendered(data);
            this.applyDataToControls(data);
            this.additionalTaskOnDelete(data);
            this.subEditorHandlers.forEach( ed =>{
                ed.additionalTaskOnDelete(data) ; 
            }); 
        });
    }
    /**
     * tambah data baru
     */
    viewData(data: DATA) {
        this.setStateHelper(st => {
            st.currentEditedData = data;
            st.editorState = 'view';
        }, () => {
            this.taskOnViewBeforeDataRendered(data);
            this.applyDataToControls(data);
            this.additionalTaskOnView(data);
            this.subEditorHandlers.forEach( ed =>{
                ed.additionalTaskOnView(data) ; 
            }); 
        });
    }
    /**
     * tambah data baru
     */
    addNewData(data: DATA) {
        this.setStateHelper(st => {
            st.currentEditedData = data;
            st.editorState = 'add';
        }, () => {
            this.taskOnAddBeforeDataRendered(data);
            this.applyDataToControls(data);
            this.additionalTaskOnAdd(data);
            this.subEditorHandlers.forEach( ed =>{
                ed.additionalTaskOnAdd(data) ; 
            }); 
        });
    }

    /**
     * edit data. render data ke editor
     */
    editData(data: DATA) {
        this.setStateHelper(st => {
            st.currentEditedData = data;
            st.editorState = 'edit';
        }, () => {
            this.taskOnEditBeforeDataRendered(data);
            this.applyDataToControls(data);
            this.additionalTaskOnEdit(data);
            this.subEditorHandlers.forEach( ed =>{
                ed.additionalTaskOnEdit(data) ; 
            }); 
        });
    }

    componentDidMount() {
        //componentDidMount
        console.log('[CoreBaseReactMemoryDrivenEditorPanel#componentDidMount] default componentDidMount di panggil untuk editor');
        this.lookupManager.requestLookupData({
            onLookupAccepted: (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => {
                if (!isNull(indexedLookup)) {
                    let keys: string[] = Object.keys(indexedLookup);
                    if (keys.length > 0) {
                        this.setStateHelper(st => {
                            keys.forEach(k => {
                                st.lookups[k] = indexedLookup[k];
                            });
                        })
                    }


                }
                console.log('[CoreBaseReactMemoryDrivenEditorPanel#componentDidMount] data lookup : ', indexedLookup);
            }
        });
    }









    /**
     * validasi data tambahan. di run dalam proses add. kalau di perlukan override di sini
     */
    additionalValidationAddData(messageContainer: ReactEditorBannerMessage[]): boolean {
        return true;
    }

    /**
     * validasi data tambahan(edit). kalau di perlukan override di sini
     */
    additionalValidationEditData(messageContainer: ReactEditorBannerMessage[]): boolean {
        return true;
    }

    /**
     * validasi data tambahan(edit). kalau di perlukan override di sini
     */
    additionalValidationDeleteData(messageContainer: ReactEditorBannerMessage[]): boolean {
        return true;
    }

    /**
     * task tambahan dalam proses delete data
     */
    additionalTaskOnDelete(data: DATA) { }
    /**
     * task tambahan pada saat init edit data
     */
    additionalTaskOnEdit(data: DATA) { }
    /**
     * task tambahan dalam proses add new data
     */
    additionalTaskOnAdd(data: DATA) {

    }
    /**
     * task tambahan dalam proses view
     */
    additionalTaskOnView(data: DATA) {

    }

}

