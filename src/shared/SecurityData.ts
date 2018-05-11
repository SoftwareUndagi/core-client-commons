export namespace SecurityData {
    /**
     * data menu aplikasi
     */
    export interface MenuData {
        id ?: number ; 
        code ?: string ;
        label ?: string ;
        css ?: string  ; 
        parentId ?: number ; 
        menuTreeCode ?: string ; 
        orderNo ?: number ;  
        treeLevel ?: number;
        routePath ?: string  ; 
        additionalParameter ?: string ; 
        allowCreate ?: string  ; 
        allowEdit ?: string  ; 
        allowDelete: string ;
        /**
         * hanya di sisi client. 
         */
        children ?: MenuData[] ;
         
    }

    /**
     * unit kerja
     */
    export interface    UnitOfWork   {
        /**
         * id unit of work. as string, if number. if code and id same , then those will be equal value
         */
        id: any ; 
        /**
         * kode unit kerja
         */
        code: string ; 
        /**
         * unit of work name
         */
        name: string ; 
    }  
    /**
     * data employee di sederhanakan
     */
    export interface SimplifiedEmployee {
        /**
         * id employee , as strring. kalaupun angka di stringkan. agar bisa akomodir semua
         */
        employeeId: string ; 
        /**
         * nama pegawai 
         */
        name: string ; 
        /**
         * pangkat/nama/jabatan
         */
        title: string ; 
        /**
         * data unit kerja
         */
        unitOfWork: UnitOfWork ;
       
    }

    /**
     * data user login, ini ikut dengan passport
     * @author Gede Sutarsa
     */
    export interface UserLoginData {
        /**
         * username
         */
        username: string ;
        
        /**
         * real name
         */
        realName: string ;
        
        /**
         * email dari user
         */
        email: string ; 
        /**
         * id internal dari data
         */
        userId: number ; 
        /**
         * url avatar, untuk profile dari user
         */
        avatarUrl: string  ; 
        /**
         * nomor bisnis dari pegawai, nomor yang tercantum dalam name tag etc
         */
        employeeNumber: string ;
        /**
         * IP dari user di deteksi oleh server bedsarkan login
         */
        ipAddress ?: string ; 
        /**
         * kode cabang/unit kerja dst
         */
        branchCode ?: string ;  
        /**
         * kode dari user role. kalau kode di perlukan
         */
        userRoleCodes ?: string [] ; 
        /**
         * id role/ user group di mana user tergabaung
         */
        userRoleIds ?: number [] ; 
        /**
         * data menu milik user
         */
        menu: MenuData[] ; 
        /**
         * reference ke data employee. ini di isikan masing-masing aplikasi. kalau keperluan ke employee di perlukan
         */
        employeeData ?: SimplifiedEmployee ; 
        /**
         * data employee raw. silakan di isikan kalau di perlukan
         */
        rawEmployeeData ?: any ;  
        /**
         * locale code
         */
        localeCode?: string; 
    }

}