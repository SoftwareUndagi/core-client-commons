
export namespace CommonClientData {
    
    
    /**
     * simple key value. misal untuk compbo box
     */
    export interface SimpleKeyValue {
        /**
         * untuk bagian value 
         */
        value : string ; 
        /**
         * untuk bagian label
         */
        label : string ; 
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
     * interface untuk akses ke security
     */
    export interface UserPrivilage {
        /**
         * user berhak create / new data
         */
        allowCreate : boolean ; 
        
        /**
         * user berhak untuk edit data yang di pilih
         */
        allowEdit : boolean ;
        
        /**
         * user berhak untuk menghapus data
         */
        allowDelete : boolean ;        
    }
    
    
    
    /**
     * data user information
     */
    export interface UserInformationData {
        
    }
}

