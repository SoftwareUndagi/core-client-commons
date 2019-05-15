import { isNull, CommonLookupValue } from 'base-commons-module';
import { CoreAjaxHelper } from '../../utils/index';
import { BaseComponent, BaseComponentState } from '../BaseComponent';
import { ListOfValueManager } from '../ListOfValueManager';
import { CustomValidationFailureResult, EditorInputElement } from './CommonsInputElement';
import { CoreBaseSubEditorPanel } from './CoreBaseSubEditorPanel';
import { EditorSubPanelHandler } from './EditorSubPanelHandler';

/**
 * editor state untuk editor data
 */
export interface CoreBaseReactEditorPanelState<DATA> extends BaseComponentState {

    /**
     * state editor. kalau sudah ada data --> add , edit, delete, view. kalau masih di antara maka mempergunakan none. untuk state perantara
     */
    editorState:  string ; // 'add'|'edit'|'delete'|'view'|'none'; 

    /**
     * data yang di edit
     */
    currentEditedData: DATA ; 
    /**
     * lookup di index
     */
    lookups ?: {[id: string]: CommonLookupValue[] } ;
    /**
     * sub editors
     */
    subEditors ?: CoreBaseSubEditorPanel<DATA , any , any >[]  ; 
}

/**
 * base interface untuk untuk editor
 */
export abstract class CoreBaseReactEditorPanel<DATA  , PROP , STATE extends CoreBaseReactEditorPanelState<DATA>> extends BaseComponent<PROP , STATE>  {
    /**
     * css default untuk error case
     */
    static CSS_FOR_ERROR_BANNER: string  = 'alert alert-danger' ;
    /**
     * nama method untuk assign force load data key dari control. jadi dari control data di baca dan di masukan ke dalam state
     */
    static KEY_METHOD_NAME_FOR_FORCE_READ_CONTROL_DATA: string = 'assignForceReadDataFromControlMethod'; 
    /**
     * handler sub editor. ini untuk editor segments
     */
    protected subEditorHandlers: Array<EditorSubPanelHandler<DATA>> = [] ; 
    /**
     * untuk lookup
     */
    lookupManager: ListOfValueManager ; 
    /**
     * untuk akses ke ajax
     */
    ajaxUtils: CoreAjaxHelper ; 
    /**
     * key untuk element input
     */
    keyToSelf: string ; 
    /**
     * worker untuk membaca data edited data. 
     */
    editedDataRetrieverMethod: () => any ; 
    /**
     * register variable ke parent
     */
    registerVariableMethod: (variableName: string , input: any ) => any ;

    /**
     * array of input element. apa saja yang di miliki oleh editor
     */
    inputElements: EditorInputElement[] = [] ;  
    /**
     * error message viewer
     */
    static SHOW_ERROR_MESSAGE: (erorrCode: string , errorMessage: string , rawError: any , next: () => any ) => any  = (erorrCode: string, errorMessage: string, rawError: any , next: () => any ) => {
        console.error('Setup library client-commons tidak beres. variable :CoreBaseReactEditorPanel.SHOW_ERROR_MESSAGE tidak di set. anda mungkin perlu memasukan toast message atau semacam nya'); 
        next(); 
    }
    static SHOW_INFO_MESSAGE: (title: string, messageContent: string ,   next: () => any ) => any  = (erorrCode: string, errorMessage: string , next: () => any ) => {
        console.error('Setup library client-commons tidak beres. variable :CoreBaseReactEditorPanel.SHOW_INFO_MESSAGE tidak di set. anda mungkin perlu memasukan toast message atau semacam nya'); 
        next(); 
    }

    /**
     * label standard untuk label button delete. override ini apda saat bootstrap kalau misal memakai bahasa yang berbeda
     */
    static DEFAULT_BUTTON_LABEL_SAVE_DELETE: () => string  =  () => { return 'Hapus'; };
    /**
     * label standard untuk label button edit. override ini apda saat bootstrap
     */
    static DEFAULT_BUTTON_LABEL_SAVE_EDIT:  () => string  =  () => { return  'Simpan';  }; 

    /**
     * label standard untuk label button add. override ini apda saat bootstrap
     */
    static DEFAULT_BUTTON_LABEL_SAVE_ADD:  () => string  =  () => { return  'Simpan'; }; 
    /**
     * untuk tutup panel
     */
    static DEFAULT_BUTTON_LABEL_CLOSE:  () => string  =  () => { return  'Tutup'; };
    /**
     * default worker untuk assign loookup. ini akan otomatis menaruh data ke dalam state
     */
    assignLookupData:  (lookupId: string , lookupData: CommonLookupValue[] ) => any = (lookupId: string , lookupData: CommonLookupValue[] ) => {
        //
    }
    /**
     * handler untuk register sub editor handler
     */
    protected registerSubEditorHandler: ( handler: EditorSubPanelHandler<DATA> ) => any  = ( handler: EditorSubPanelHandler<DATA> ) => {
        if ( this.subEditorHandlers.indexOf(handler) < 0 ) {
            this.subEditorHandlers.push(handler) ; 
        }
    }
    /**
     * handler untuk unregister sub editor dari parent
     */
    protected unRegisterSubEditorHandler: ( handler: EditorSubPanelHandler<DATA> ) => any = ( handler: EditorSubPanelHandler<DATA> ) => {
        if ( this.subEditorHandlers.indexOf(handler) >= 0) {
            this.subEditorHandlers.splice(this.subEditorHandlers.indexOf(handler), 1 ) ; 
        }
    }
    /**
     * worker untuk unreg input panel
     */
    registrarInputElement: (inputElement: any , unRegFlag?: boolean ) => any = ( inputElement: EditorInputElement , unRegFlag?: boolean ) => {
        unRegFlag = unRegFlag || false ;
        if ( unRegFlag) {
            let idx: number = this.inputElements.indexOf(inputElement); 
            if ( idx > -1) {
                this.inputElements.splice(idx , 1 ) ; 
            }
        } else {
            if ( !isNull(  inputElement[CoreBaseReactEditorPanel.KEY_METHOD_NAME_FOR_FORCE_READ_CONTROL_DATA])) {
                let mthdForceReload: ( doNotUpdateState: boolean ) => any = (doNotUpdateState: boolean) => {
                    inputElement.fetchDataFromControl(this.state.currentEditedData);
                    if ( isNull(doNotUpdateState) || !doNotUpdateState) {
                        console.log('Control di force update ke state dari editor,cek masalah performence');
                        this.setStateHelper(st => {
                            //
                        }) ; 
                    }
                };
                inputElement[CoreBaseReactEditorPanel.KEY_METHOD_NAME_FOR_FORCE_READ_CONTROL_DATA](mthdForceReload);
            }
            if ( this.inputElements.indexOf(inputElement) < 0) {
                this.inputElements.push(inputElement); 
            }
        }
    } 
    /**
     * worker untuk register sub editor
     */
    registerSubEditor: ( editor: CoreBaseSubEditorPanel<DATA , any , any > , unRegFlag: boolean ) => any  = ( editor: CoreBaseSubEditorPanel<DATA , any , any > , unRegFlag: boolean ) => {
            if ( unRegFlag) {
            let idx: number = this.state.subEditors!.indexOf(editor); 
            if ( idx > -1) {
                this.setStateHelper( 
                    st => st.subEditors!.splice(idx , 1 ) );
            }
        } else {
            editor.assignLookupData = (lookupId: string , lookupData: CommonLookupValue[] ) => {
                this.assignLookupData(lookupId , lookupData );
            } ;
            this.setStateHelper( st => st.subEditors!.push(editor)); 
        }
    }

    constructor(props: PROP) {
        super(props) ; 
        let self: any = this ; 
        this.keyToSelf = 'objectRef' ; 
        this.ajaxUtils = this.generateAjaxUtils() ; 
        this.lookupManager = this.generateLookupManager();
        let swap: STATE = this.generateDefaultState();
        if ( !isNull(swap)) {
            swap['inputElements'] = this.inputElements ;     
        }
        if ( isNull(swap.lookups)) {
            swap.lookups = {} ; 
        }
        swap.subEditors = [] ; 
        this.state =  swap ;
        this.editedDataRetrieverMethod = () => {
            return this.state.currentEditedData ; 
        }; 
        this.registerVariableMethod = (variableName: string , input: any ) => {
            self[variableName] = input; 
        };
    }

    /**
     * generate ajax utils
     */
    abstract generateAjaxUtils (): CoreAjaxHelper ; 

    /**
     * generator lookup manager sesuai dengan penyedia, web atau react akan berbeda untuk bagian ini
     */
    abstract generateLookupManager (): ListOfValueManager ; 

    /**
     * worker untuk update data dari editor segment
     */
    updateEditedDataOnParentContainerState: (f: (dataToUpdate: DATA) => any) => any = (f: (dataToUpdate: DATA) => any) => {
        this.setStateHelper (salinan => {
            f(salinan.currentEditedData);
            return salinan ; 
        });
    }
    /**
     * akses ke sub editor
     */
    get subEditors (): CoreBaseSubEditorPanel<DATA , any , any >[] {
        return this.state.subEditors! ; 
    }
    /**
     * state default bawaan untuk di taruh dalam data
     */
    abstract  generateDefaultState (): STATE ; 

    /**
     * validasi mandatory field custom
     */
    validateMandatoryField (): Array<CustomValidationFailureResult>  {
        let rtvl: Array<CustomValidationFailureResult> = [] ; 
        for ( let inp of this.inputElements) {
            let mndtoryHaveError: boolean = false ; 
            if ( !isNull( inp['runMandatoryValidation']) ) {
                let swapHasil: CustomValidationFailureResult = inp['runMandatoryValidation'](); 
                if ( !isNull(swapHasil) ) {
                    rtvl.push(swapHasil); 
                    mndtoryHaveError = true ; 
                }
            }
            if ( !mndtoryHaveError) {
                if ( !isNull(inp['runCustomValidation']) && typeof inp['runCustomValidation'] === 'function') {
                    let swapHasil: any =  inp['runCustomValidation']() ; 
                    if ( !isNull(swapHasil)) {
                        if ( Array.isArray(swapHasil)) {
                            rtvl.push(...swapHasil) ; 
                        } else {
                            rtvl.push(swapHasil) ; 
                        }
                    }
                }
            }

        }
        for ( let subEd of this.subEditors) {
            let swapHasilEd: Array<CustomValidationFailureResult> = subEd.validateMandatoryField() ; 
            if ( !isNull(swapHasilEd) && swapHasilEd.length > 0  ) {
                rtvl.push(...swapHasilEd)  ; 
            }
        }
        return rtvl ; 
    }
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
    abstract getColMaxLength (fieldName: string , modelName ?: string ): number ; 
    
    /**
     * container data lookup
     */    
    get lookupContainers ():  {[id: string ]: CommonLookupValue[] } {
        return this.state.lookups! ; 
    }
    
    /**
     * perbaiki data yang bertipe field
     */
    fixDateFields (data: any , dateFields: string[] ) {
        if ( data == null || typeof data === 'undefined') {
            return ;
        }
        for ( var v of dateFields) {
            let swapD: any = data[v]; 
            if ( swapD == null || typeof swapD === 'undefined') {
                data[v] = null ; 
                continue ; 
            }
            if ( typeof swapD === 'string') {
                let dDate: Date = new Date(swapD) ; 
                if (  isNaN( dDate.getUTCFullYear()) ) {
                    data[v] = null ; 
                    continue ; 
                }
                data[v] = dDate ; 
            }
        }
    }
    /**
     * assign data ke dalam control. ini dalam kasus add, edit, delete, view
     */
    applyDataToControls (data: DATA ) {
        for ( var inp of this.inputElements ) {
            inp.assignDataToControl( data , true) ;
        } 
        for ( var ed of this.subEditors ) {
            ed.assignDataToControl(data  , true) ;
        }  
    }
    /**
     * menyalin data dari control
     */
    fetchDataFromControls ( data: DATA ) {
        for ( var inp of this.inputElements ) {
            inp.fetchDataFromControl( data) ;
        } 
        for ( var sub of this.subEditors) {
            sub.fetchDataFromControl(data);
        }
    } 
    
}