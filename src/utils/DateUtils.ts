

export interface DateFormater {
    parse(param: string): Date;
    format(param: Date): string;
}

/**
 * time foramatter
 */
export class TimeFormater {

    constructor(private pattern: string ) {

    }
    /**
     * format time only
     */
    format   (param: Date): string {
        if ( param  == null || typeof param === 'undefined') {
            return ''; 
        }
        if ( typeof param === 'string') {
            param = new Date(param + '');
        }
        if ( param.getHours == null || typeof param.getHours === 'undefined' || isNaN( param.getHours()) ) {
            return ''; 
        }
        let h: string   = param.getHours() < 10 ? '0' + param.getHours() : param.getHours() + '' ;
        let m: string   = param.getMinutes() < 10 ? '0' + param.getMinutes() : param.getMinutes() + '' ;
        let s: string   = param.getSeconds() < 10 ? '0' + param.getSeconds() : param.getSeconds() + '' ; 
        if ( this.pattern === 'hh:MM') {
            return h + ":" + m ; 
        }
        if ( this.pattern === 'hh:MM:ss') {
            return h + ":" + m + ':' + s ;
        }
        return param + ''; 
        
    } 
}

export interface DateDef {
    delimiter: string;
    componentIndex: number[];
    shortYear: boolean;
}

/**
 * selisih tahun + bulan
 */
export interface YearAndMonthDiff {
    /**
     * selisih tahun
     */
    year: number; 
    /**
     * selisih bulan
     */
    month: number;
}

export class DateUtils {
    /**
     * format tanggal aplikasi saat ini
     */
    static CURRENT_DATE_FORMAT: string = "dd/mm/yyyy"; 
    /**
     * nama bulan . index = bulan dalam angka
     * value : label nama bulan. default bahasa indonesia
     */
    static MONTH_NAMES: { [id: number]: string } = {
        1: "Januari",
        2: "Februari",
        3: "Maret",
        4: "April",
        5: "Mei",
        6: "Juni",
        7: "Juli",
        8: "Agustus",
        9: "September",
        10: "Oktober",
        11: "November",
        12: "Desember"
    };
    static ACCEPTED_FORMAT: string[] = [
        "dd/mm/yyyy",
        "mm/dd/yyyy",
        "dd/mm/yy",
        "mm/dd/yy",
        "dd-mm-yyyy",
        "mm-dd-yyyy",
        "dd-mm-yy",
        "mm-dd-yy",
        "yyyy-mm-dd"

    ];
    static ACCEPTED_TIME_FORMAT: string[] = [
        'hh:MM' , 
        'hh:MM:ss'
    ];
    /**
     * index 0 : tahun
     * index 1 : bulan 
     * index 2 : tgl 
     */
    static DATE_COMPONENT_INDEX: { [id: string]: DateDef } = {
        "dd/mm/yyyy": { delimiter: "/", componentIndex: [2, 1, 0], shortYear: false },
        "mm/dd/yyyy": { delimiter: "/", componentIndex: [2, 0, 1], shortYear: false },
        "dd/mm/yy": { delimiter: "/", componentIndex: [2, 1, 0], shortYear: true },
        "mm/dd/yy": { delimiter: "/", componentIndex: [2, 0, 1], shortYear: true },
        "dd-mm-yyyy": { delimiter: "-", componentIndex: [2, 1, 0], shortYear: false },
        "mm-dd-yyyy": { delimiter: "-", componentIndex: [2, 0, 1], shortYear: false },
        "dd-mm-yy": { delimiter: "-", componentIndex: [2, 1, 0], shortYear: true },
        "mm-dd-yy": { delimiter: "-", componentIndex: [2, 0, 1], shortYear: true },
        "yyyy-mm-dd": { delimiter: "-", componentIndex: [0, 1, 2], shortYear: false },
    };
    /**
     * time formatter
     */
    static TIME_FORMATTER: {[id: string ]: TimeFormater } = {
        'hh:MM' : new TimeFormater('hh:MM') , 
        'hh:MM:ss' : new TimeFormater('hh:MM:ss') ,
    };
    static DATE_FORMATTER: { [id: string]: DateFormater } = {
        "dd/mm/yyyy": {
            parse: function (param: string): Date    {
                param = (param || null)!;
                if (param == null || param === "") {
                    return (null)!;
                }
                let arrStr: string[] = param.split("/");
                return new Date(arrStr[2] + "-" + arrStr[1] + "-" + arrStr[0]);
            },
            format: function(param: Date): string {
                return DateUtils.formatDate(param, "dd/mm/yyyy");
            }
        },
        "mm/dd/yyyy": {
            parse: function(param: string): Date {
                param = (param || null)!;
                if (param == null || param === "") {
                    return (null)!;
                }
                let arrStr: string[] = param.split("/");
                return new Date(arrStr[2] + "-" + arrStr[0] + "-" + arrStr[1]);
            },
            format: function(param: Date): string {
                return DateUtils.formatDate(param, "mm/dd/yyyy");
            }
        }

    };
    static fixIfNotValidDate ( date: any ) {
        if ( date == null || typeof date === "undefined") {
            return null ; 
        }
        if ( typeof date === "string") {
            let dStr: string = date ; 
            if ( dStr.indexOf("T") >= 0 ) {
                return new Date(dStr); 
            }
        }
        return date ; 
    }
    /**
     * selisih tahun + bulan
     * @param date1 tgl yang lebih baru(lebih besar)
     * @param date2 tgl yang lebih kecil(selisih dengan current lebih besar)
     */
    static getYearAndMonthDiff(date1: Date, date2: Date): YearAndMonthDiff {
        let sNull: any = null ; 
        date1 = date1 || null;
        date2 = date2 || null;
        if (date1 == null || date2 == null) {
            return sNull;
        }
        date1 = DateUtils.fixIfNotValidDate(date1 );
        date2 = DateUtils.fixIfNotValidDate(date2 );
        var year1: number = date1.getFullYear();
        var month1: number = date1.getMonth() + 1;
        var day1: number = date1.getDate();

        var year2: number = date2.getFullYear();
        var month2: number = date2.getMonth() + 1;
        var day2: number = date2.getDate();
        if (year2 > year1) {
            return {
                year: 0,
                month: 0
            };
        }
        if (year1 === year2 && (month2 > month1 || (month2 === month1 && day2 >= day1))) {
            return {
                year: 0,
                month: 0
            };
        }
        if (day2 > day1) {
            month2 = month2 + 1;
            if (month2 > 12) {
                month2 = 1;
                year2 = year2 + 1;
            }
        }
        var dY: number = year1 - year2;
        var dM: number = month1 - month2;
        if (dY < 0) {
            dY = 0;
        }
        if (dM < 0) {
            dM = 0;
        }
        return {
            year: dY,
            month: dM
        };
    } 
    static make2Digit(n: number): string {
        if (n < 9) {
            return "0" + n;
        }
        return "" + n;
    }
    /**
     * parse string menjadi Date 
     * @param dateAsString string tanggal yang perlu di parsing
     * @param pattern date pattern. silakan di cek DATE_COMPONENT_INDEX
     */
    static parseDate(dateAsString: string, pattern?: string): Date {
        pattern = pattern || DateUtils.CURRENT_DATE_FORMAT;
        dateAsString = (dateAsString || null)!;
        if (dateAsString == null || dateAsString === "") {
            return (null)!;
        }
        let keys: string[] = Object.keys(DateUtils.DATE_COMPONENT_INDEX);
        if (keys.indexOf(pattern) === -1) {
            console.error("[dateutil]Tgl :" + pattern + " , tidak di definisikan, silakan pergunakan salah satu dari :[" + keys.join(",") + "]");
        }
        let dataDef: DateDef = DateUtils.DATE_COMPONENT_INDEX[pattern];
        let prt: string[] = dateAsString.split(dataDef.delimiter);
        if (prt.length !== 3) {
            console.error("[dateutil]Tgl :" + dateAsString + ", bukan format yang benar dengan pattern : " + pattern + ", silakan di cek");
            return (null)!;
        }

        if (dataDef.shortYear) {
            prt[dataDef[0]] = "" + (parseInt(prt[dataDef[0]], 10) + 1900);
        }
        try {
            return new Date(prt[0] + "-" + prt[1] + "-" + prt[2]);
        } catch (exc) {
            console.error("Gagal memperoses tanggal : " + dateAsString + ", dengan pattern : " + pattern + ", error : " + exc.message);
            return (null)!;
        }
    }
    /**
     * membaca nama bulan .
     */
    static getMonthName (date: Date): string {
        if ( date == null || typeof date === "undefined") {
            return (null)! ; 
        }
        let bln: number = ( date.getMonth() || 0 ) + 1  ; 
        return DateUtils.MONTH_NAMES[bln]; 
    }
    /**
     * split date , berdasarkan pattern yang di minta
     */
    static formatDate(date: Date, pattern?: string): string {
        if (  date == null || typeof date === 'undefined') {
            return '' ; 
        }
        try {
            if (pattern == null || typeof pattern === "undefined" || pattern === "") {
                pattern = DateUtils.CURRENT_DATE_FORMAT;
            }
            if ( date != null && typeof date !== 'undefined') {
                if ( typeof date === 'string') {
                    date = new Date(date + '');
                }
            }
            
            return pattern
                .split("mm").join(DateUtils.make2Digit(date.getMonth() + 1) + "")
                .split("dd").join(DateUtils.make2Digit(date.getDate()) + "")
                .split("yyyy").join(date.getFullYear() + "")
                .split("ys").join((date.getFullYear() - 1900) + "");
        } catch (exc) {
            console.error("[DateUtils] gagal format ", date, ", pattern : ", pattern, ",error : ", exc.message);
            return (null)!;
        }
    }
    /**
     * nambah hari ke dalam tanggal
     * @param dateToAdd tanggal utuk di add
     * @param day jumlah hari untuk untuk di tambahkan 
     */
    static addDate ( dateToAdd: Date , day: number ): Date {
        let salinan: Date = new Date(dateToAdd) ; 
        salinan.setDate( salinan.getDate() + day) ; 
        return salinan ; 
    }
    /**
     * mencari tanggal pertama pada bulan
     * @param date tanggal di cari tanggal 1mya
     */
    getFirstDayOfMonth (date: Date ): Date {
        if ( !date) {
            return (null)! ; 
        }
        return new Date( date.getFullYear() + '-' + (date.getMonth() + 1) + '-1' );
    }
    /**
     * mencari tanggal akhir bulan pada date yang di minta
     * @param date tanggal untuk di cari akhir bulan nya
     */
    getLastDayOfMonth (date: Date ): Date {
        if ( !date) {
            return (null)! ; 
        }
        let thn: number = date.getFullYear() ; 
        let bln: number = date.getMonth() + 2 ; 
        if ( bln > 12) {
            thn = thn + 1 ; 
            bln = 1; 
        }
        let tgl1BulanDepan: Date = new Date( thn + '-' + bln + '-1'  );
        tgl1BulanDepan.setDate( tgl1BulanDepan.getDate() - 1 );
        return tgl1BulanDepan ; 
    }

}