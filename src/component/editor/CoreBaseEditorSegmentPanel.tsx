import { isNull, CommonLookupValue } from 'base-commons-module';
import { BaseComponent } from '../BaseComponent';
import { ListOfValueManager } from '../ListOfValueManager';
import { EditorInputElement } from './CommonsInputElement';
import { EditorSubPanelHandler } from './EditorSubPanelHandler';
export interface CoreBaseEditorSegmentPanelProps <DATA> {

    /**
     * data yang di edit
     */
    currentEditedData: DATA ; 
    /**
     * state dari editor
     */
    editorState: 'add' |'edit'|'delete'|'view' ; 

    /**
     * worker untuk unreg input panel. sebaiknya tidak mempergunakan ini secara langsung. pergunakan method : registrarInputElement  pada control, 
     * dengan begitu control akan terdaftar pada component, bukan cuma di parent
     */
    registrarInputElement: (inputElement: any, unRegFlag?: boolean) => any;
    /**
     * container lookup
     */
    lookupContainers: {[id: string]: CommonLookupValue[] }; 
    /**
     * lookup manager pada parent 
     */
    lookupManager: ListOfValueManager ; 
    /**
     * assign data lookup
     */
    assignLookupData: (lovId: string , lookups:  CommonLookupValue[]) => any ; 
    /**
     * untuk update state pada edited data pada container dari segment
     * @param method untuk update state. anda perlu update pada bagian data saja, update state akan di handle 
     */
    updateEditedDataOnParentContainerState:  ( f: (dataToUpdate: DATA ) => any    ) => any ; 
    /**
     * flag load data pada saat component mounted atau tidak. kalau true method : reAssignDataToControl
     */
    loadDataMounted ?: boolean ; 
    /**
     * register sub editor ke parent
     */
    registerToParentEditor: (  subEditor: EditorSubPanelHandler<DATA> ) => any ; 
    /**
     * unregister dari parent
     */
    unRegisterFromParentEditor: (  subEditor: EditorSubPanelHandler<DATA> ) => any ; 
}
export interface CoreBaseEditorSegmentPanelState <DATA> {
    dummyVar ?: DATA ; 
} 

/**
 * segment helper dari editor. agar bisa break down editor dalam component-component
 */
export abstract class CoreBaseEditorSegmentPanel<DATA , PROPS extends CoreBaseEditorSegmentPanelProps<DATA> , STATE extends CoreBaseEditorSegmentPanelState<DATA>>  extends BaseComponent <PROPS , STATE> implements EditorSubPanelHandler<DATA> {
    /**
     * controls input
     */
    controls: EditorInputElement[] = []; 
    constructor(public modelName: string , props: PROPS ) {
        super(props) ; 
        this.state = this.generateDefaultState () ; 
    }    
    
    /**
     * worker untuk unreg input panel. 
     * ini register internal + register ke parent
     */
    registrarInputElement: (inputElement: any , unRegFlag?: boolean)  =>  any = (inputElement: any, unRegFlag?: boolean)  => {
        if ( unRegFlag) {
            let idx: number = this.controls.indexOf(inputElement) ; 
            if ( idx >= 0 ) {
                this.controls.splice(idx , 1) ; 
            }
        } else {
            let idx: number = this.controls.indexOf(inputElement) ; 
            if ( idx < 0 ) {
                this.controls.push(inputElement);
            }
        }
        this.props.registrarInputElement(inputElement , unRegFlag);
    }
    componentDidMount () {
        if ( !isNull(this.props.loadDataMounted) && this.props.loadDataMounted) {
            this.reAssignDataToControl(); 
        }
        if ( !isNull(this.props.registerToParentEditor)) {
            this.props.registerToParentEditor(this) ; 
        }
    }
    componentWillUnmount() {
        if ( !isNull(this.props.unRegisterFromParentEditor)) {
            this.props.unRegisterFromParentEditor(this) ; 
        }
    }

    /**
     * generate state awal data
     */
    abstract generateDefaultState (): STATE  ; 
    /**
     * re-assign data dari state ke control
     */
    reAssignDataToControl () {
        let val: any = this.props.currentEditedData ; 
        if ( isNull(this.props.currentEditedData)) {
            val = {} ; 
        }
        for ( let ctrl of this.controls) {
            ctrl.assignDataToControl(val);
        }
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
    abstract getColMaxLength (fieldName: string , modelName?: string ): number  ; 
    
    /**
     * task tambahan dalam proses delete data
     */
    additionalTaskOnDelete(data: DATA) { 
        //
    }
    /**
     * task tambahan pada saat init edit data
     */
    additionalTaskOnEdit(data: DATA) { 
        //
    }
    /**
     * task tambahan dalam proses add new data
     */
    additionalTaskOnAdd(data: DATA) {
        //
    }
    /**
     * task tambahan dalam proses view
     */
    additionalTaskOnView(data: DATA) {
        //
    }
}