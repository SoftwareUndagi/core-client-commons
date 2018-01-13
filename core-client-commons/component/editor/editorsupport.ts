
import { isNull } from '../../utils/CommonUtils';
import { CommonCommunicationData } from '../../shared/index';




/**
 * container data sisi client
 */
export namespace editorsupport{



	/**
	 * interface untuk editor sub panel
	 */
	export interface EditorSubPanelHandler<DATA> {
		/**
		 * task tambahan dalam proses delete data
		 */
		additionalTaskOnDelete(data: DATA)  ; 
		/**
		 * task tambahan pada saat init edit data
		 */
		additionalTaskOnEdit(data: DATA) ;
		/**
		 * task tambahan dalam proses add new data
		 */
		additionalTaskOnAdd(data: DATA) ;
		/**
		 * task tambahan dalam proses view
		 */
		additionalTaskOnView(data: DATA) ;
	}


	/**
	 * untuk detach event
	 */
	export interface UnregisterChangeHandlerWorker {

		() : any ; 
	}
	/**
	 * container modifikasi data
	 */
	export interface MoficationDataResultContainer<DATA> {
		/**
		 * item-item yang baru di buat
		 */
		addedItems? : DATA[] ; 
		/**
		 * item2 yang di hapus
		 */
		erasedItems? : DATA [] ;
		/**
		 * item yang di modif
		  */ 
		modifiedItems? : DATA[] ; 
	}
    
    /**
 	* container client side edit data 
 	*/
	export class ClientSideEditorContainer<DATA> {
		
		
		private _allStillExistData : DATA[]  =[] ; 
		private _erasedData : DATA[]=[] ; 
		private _newCreatedData : DATA[]=[] ; 
		private _modifiedsData : DATA[]=[] ; 
		
		private _listeners : any[] =[];
		  
		/**
		 * data dari db/server
		  */  
		private _initData : any [] = [] ; 
		
		/*
		private _idExtractor : (data : DATA)=> string ; 
		
		constructor (idExtractor : (data : DATA)=> string ) {
			this._idExtractor = idExtractor ; 
		}*/


		constructor(private  sorter ? : (a : DATA , b : DATA )=> number ) {

		}
		
		
		initiatePopulateData (initialData : DATA[]) {
			if ( initialData == null ||typeof initialData=="undefined"){
				initialData=[]; 
			}
			this._allStillExistData = initialData ;
			this._initData = [] ; 
			if  ( !isNull(initialData )){
				this._initData.push(...initialData);
			}  
			this.propagateChange(); 
			
		}
		
		
		

		/**
		 * count data yang masih ada
		 */
		get countAllAvailable () : number {
			if  ( isNull(this._allStillExistData)){
				return 0 ;
			}
			return this._allStillExistData.length ; 
		}


		/**
		 * count data yang baru di add
		 */
		get countNewData () : number {
			if  ( isNull(this._newCreatedData)){
				return 0 ;
			}
			return this._newCreatedData.length ; 
		}

		/**
		 * count data yang di edit
		 */
		get countEditedData () : number {
			if  ( isNull(this._modifiedsData)){
				return 0 ;
			}
			return this._modifiedsData.length ; 
		}

		/**
		 * count data yang di hapus
		 */
		get countErasedData () : number {
			if  ( isNull(this._erasedData)){
				return 0 ;
			}
			return this._erasedData.length; 
		}
		
		
		/**
		 * berapa data count dalam container
		 */
		public get detailCount() : number {
			if ( this._allStillExistData == null || typeof this._allStillExistData =='undefined') {
				return 0 ; 
			}
			return this._allStillExistData.length ; 
		}
		
		
		
		/**
		 * register change handler
		 */
		registerChangeHandler (changeHandler : ()=> any ) : UnregisterChangeHandlerWorker  {
			this._listeners.push(changeHandler); 
			return ()=>{
				let idx : number = this._listeners.indexOf(changeHandler);
				if ( idx>=0){
					this._listeners.splice(idx , 1 ) ;
				}
			}
		}

		/**
		 * register change handler
		 */
		unRegisterChangeHandler (changeHandler : ()=> any ) {
			if ( this._listeners.indexOf(changeHandler)>=0) {
				this._listeners.splice(this._listeners.indexOf(changeHandler));
			}
		}
		
		
		
		
		/**
		 * semua data yang masih ada dalam data
		 */
		getAllStillExistData () : DATA [] {
			return this._allStillExistData ; 
		}
		
		
		
		/**
		 * data modifikasi
		 */
		getModificationResult () : MoficationDataResultContainer<DATA> {
			return {
				addedItems : this._newCreatedData , 
				erasedItems : this._erasedData , 
				modifiedItems : this._modifiedsData 
			} ; 
		}


		/**
		 * generate bulk edit data untuk di kirim ke server
		 * @param idField nama field primary key dari model object
		 */
		getBulkModificationResult (idField :string ) : CommonCommunicationData.BulkDataModificationContainer<DATA , any > {
			let added : DATA[] = [] ; 
			let edited : DATA[] =[] ; 
			added.push(...this._newCreatedData );
			edited.push(...this._modifiedsData); 
			let rtvl : CommonCommunicationData.BulkDataModificationContainer<DATA , any > = {
				appendedItems : added , 
				modifiedItems : edited , 
				erasedItems : [] 
			}
			if ( this._erasedData.length>0) {
				for ( let er of this._erasedData) {
					rtvl.erasedItems.push(er[idField]);
				}
			}
			return rtvl ; 
		}
		
		
		
		/**
		 * tambah data baru
		 * @param data data untuk di tambahkan dalam container
		 * @param doNotUpdate flag untuk tidak propagete change
		 */
		appendNewData ( data : DATA , doNotUpdate ? : boolean ) {
			var self : ClientSideEditorContainer<DATA> = this ;
			this._allStillExistData.push(data) ; 
			if ( !isNull(this.sorter)) {
				this._allStillExistData.sort( this.sorter);
			}
			this._newCreatedData.push(data) ; 
			if ( isNull(doNotUpdate)|| !doNotUpdate) {
				self.propagateChange();
			}
		}


		/**
		 * append new bulk data ke dalam container. as array
		 * @param data array of data untuk di entry ke dalam container
		 * @param doNotUpdate flag apakah data langsung di update atau tidak
		 */
		appendNewDataBulk (data : Array<DATA> , doNotUpdate ? : boolean  ) {
			if (  isNull(data ) || data.length == 0 ) {
				return ; 
			}
			this._allStillExistData.push(...data) ; 
			if ( !isNull(this.sorter)) {
				this._allStillExistData.sort( this.sorter);
			}
			this._newCreatedData.push(...data) ; 
			if ( isNull(doNotUpdate)|| !doNotUpdate) {
				this.propagateChange();
			}
		}


		
		
		
		
		/**
		 * edit data
		 */
		editData (data : DATA , doNotUpdate ? : boolean) {
			var self : ClientSideEditorContainer<DATA> = this ;
			var idxOnNew : number = this.findOnArray(data , this._newCreatedData) ; 
			if ( idxOnNew>=0 ) {
				
			}else {
				var idxOnEdit : number = this.findOnArray(data , this._modifiedsData) ; 
				var idxOnExistData : number = this.findOnArray(data , this._initData) ;
				if ( idxOnExistData>=0 && idxOnEdit==-1){
					this._modifiedsData.push(data) ; 
				}
			}
			
			if ( isNull(doNotUpdate)|| !doNotUpdate) {
				self.propagateChange();
			}
		}
		
		/**
		 * hapus data
		 */
		deleteData( data : DATA  , doNotUpdate ? : boolean) {
			var self : ClientSideEditorContainer<DATA> = this ; 
			let eraseIndex : number  =  this.findOnArray(data , this._allStillExistData) ; 
			var idxExist : number = this.findOnArray(data , this._initData) ; 
			this.removeFromArray(eraseIndex , this._allStillExistData) ;
			
			if ( idxExist>=0){
				this._erasedData.push(data) ; 
			}
			if ( isNull(doNotUpdate)|| !doNotUpdate) {
				self.propagateChange();
			} 
			
		}
		
		
		
		/**
		 * mencari index data dalam array
		 */
		private findOnArray (data : DATA , theArray : DATA[] ) : number {
			for ( let i  = 0 ; i< theArray.length ;i++){
				if ( theArray[i] == data) {
					return i ; 
				}
			}	
			return -1 ; 
		}
		
		
		/**
		 * hapus data dari dalam array 
		 */
		private removeFromArray ( index : number , theArray : DATA[]) {
			if ( index  <0 || index>=theArray.length){
                console.log("[ClientSideEditorContainer] di luar range untuk index : " , index ) ; 
                return ;
            }
				 
			if ( index == theArray.length-1 ) {
				theArray.pop() ; 
                console.log("[ClientSideEditorContainer] di proses pada index terakhir" ) ;
				return ; 
			}	
			theArray.splice(index , 1 ) ; 
		}
		
		
		

		/**
		 * notifikasi semua handler untuk kasus change data
		 */
		fireChangeEvent () {
			
			setTimeout( () =>{
				for ( var x of this._listeners){
					x() ; 
				}	
			} , 100); 
		}
		
		/**
		 * propagasi perubahan data ke listener
		 */
		private propagateChange  () {
			var self : ClientSideEditorContainer<DATA> = this ;
			setTimeout(function () {
				for ( var x of self._listeners){
					x() ; 
				}	
			} , 100); 
			
		}
	}	
    
    
}