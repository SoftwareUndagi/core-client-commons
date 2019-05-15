


/**
     * simple key value. misal untuk compbo box
     */
export interface SimpleKeyValue {
    /**
     * untuk bagian value 
     */
    value: string;
    /**
     * untuk bagian label
     */
    label: string;
}


/**
 * interface untuk akses ke security
 */
export interface UserPrivilage {
    /**
     * user berhak create / new data
     */
    allowCreate: boolean;

    /**
     * user berhak untuk edit data yang di pilih
     */
    allowEdit: boolean;

    /**
     * user berhak untuk menghapus data
     */
    allowDelete: boolean;
}
/**
 * data user information
 */
export interface UserInformationData {

}