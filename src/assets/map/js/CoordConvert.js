if(window.howso==undefined){
    window.howso={};
}



; howso.CoordConvert = function () {
    this._PI = Math.PI;
    this._x_pi = Math.PI * 3000.0 / 180.0;

};

/**
 * WGS-84 to GCJ-02mercator
 * @param wgsLng
 * @param wgsLat
 * @returns {{x, y}}
 */
howso.CoordConvert.prototype.wgs84_To_gcj02mercator = function ( wgsLng, wgsLat ) {
    var coord = this.wgs84_To_gcj02( wgsLng, wgsLat );
    return this.lnglat_to_mercator( coord.lng, coord.lat );
};


/**
 * GCJ-02mercator转wgs-84
 * @param x
 * @param y
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.gcj02mercator_To_wgs84 = function ( x, y ) {
    var coord = this.mercator_to_lnglat( x, y );
    return this.gcj02_To_wgs84( coord.lng, coord.lat );
};


/**
 * WGS-84 to GCJ-02
 * @param wgsLng
 * @param wgsLat
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.wgs84_To_gcj02 = function ( wgsLng, wgsLat ) {
    if ( this._outOfChina( wgsLng, wgsLat ) )
        return { lng: wgsLng, lat: wgsLat };

    var d = this._delta( wgsLng, wgsLat );
    var gcjLat = wgsLat + d.lat;
    var gcjLng = wgsLng + d.lng;
    return { lng: gcjLng, lat: gcjLat };
};



/**
 * GCJ-02 to WGS-84
 * @param gcjLng
 * @param gcjLat
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.gcj02_To_wgs84 = function ( gcjLng, gcjLat ) {
    var initDelta = 0.01;
    var threshold = 0.000000001;
    var dLat = initDelta, dLng = initDelta;
    var mLat = gcjLat - dLat, mLng = gcjLng - dLng;
    var pLat = gcjLat + dLat, pLng = gcjLng + dLng;
    var wgsLat, wgsLng, i = 0;
    while ( 1 ) {
        wgsLat = ( mLat + pLat ) / 2;
        wgsLng = ( mLng + pLng ) / 2;
        var tmp = this.wgs84_To_gcj02( wgsLng, wgsLat )
        dLat = tmp.lat - gcjLat;
        dLng = tmp.lng - gcjLng;
        if ( ( Math.abs( dLat ) < threshold ) && ( Math.abs( dLng ) < threshold ) )
            break;

        if ( dLat > 0 ) pLat = wgsLat; else mLat = wgsLat;
        if ( dLng > 0 ) pLng = wgsLng; else mLng = wgsLng;

        if ( ++i > 10000 ) break;
    }
    return { lng: wgsLng, lat: wgsLat };

};


/**
 * GCJ-02 to BD-09
 * @param gcjLng
 * @param gcjLat
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.gcj02_To_bd09=function (gcjLng, gcjLat) {
    var x = gcjLng, y = gcjLat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this._x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this._x_pi);
    var bdLng = z * Math.cos(theta) + 0.0065;
    var bdLat = z * Math.sin(theta) + 0.006;
    return { lng: bdLng, lat: bdLat };
};

/**
 * bd09_To_wgs84
 * @param bdLng
 * @param bdLat
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.bd09_To_wgs84=function (bdLng, bdLat) {
    var x = bdLng - 0.0065, y = bdLat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this._x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this._x_pi);
    var gcjLng = z * Math.cos(theta);
    var gcjLat = z * Math.sin(theta);
    
    var initDelta = 0.01;
    var threshold = 0.000000001;
    var dLat = initDelta, dLng = initDelta;
    var mLat = gcjLat - dLat, mLng = gcjLng - dLng;
    var pLat = gcjLat + dLat, pLng = gcjLng + dLng;
    var wgsLat, wgsLng, i = 0;
    while ( 1 ) {
        wgsLat = ( mLat + pLat ) / 2;
        wgsLng = ( mLng + pLng ) / 2;
        var tmp = this.wgs84_To_gcj02( wgsLng, wgsLat )
        dLat = tmp.lat - gcjLat;
        dLng = tmp.lng - gcjLng;
        if ( ( Math.abs( dLat ) < threshold ) && ( Math.abs( dLng ) < threshold ) )
            break;

        if ( dLat > 0 ) pLat = wgsLat; else mLat = wgsLat;
        if ( dLng > 0 ) pLng = wgsLng; else mLng = wgsLng;

        if ( ++i > 10000 ) break;
    }
    return { lng: wgsLng, lat: wgsLat };
};


/**
 * wgs84_To_bd09
 * @param bdLng
 * @param bdLat
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.wgs84_To_bd09=function (wgsLng, wgsLat) {
    if ( this._outOfChina( wgsLng, wgsLat ) )
        return { lng: wgsLng, lat: wgsLat };
    var d = this._delta( wgsLng, wgsLat );
    var gcjLat = wgsLat + d.lat;
    var gcjLng = wgsLng + d.lng;
    var x = gcjLng, y = gcjLat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this._x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this._x_pi);
    var bdLng = z * Math.cos(theta) + 0.0065;
    var bdLat = z * Math.sin(theta) + 0.006;
    return { lng: bdLng, lat: bdLat };

};



/**
 * bd09_To_gcj02
 * @param bdLng
 * @param bdLat
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.bd09_To_gcj02=function (bdLng, bdLat) {
    var x = bdLng - 0.0065, y = bdLat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this._x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this._x_pi);
    var gcjLng = z * Math.cos(theta);
    var gcjLat = z * Math.sin(theta);
    return { lng: gcjLng, lat: gcjLat };
};


/**
 * lnglat转mercator
 * @param lng
 * @param lat
 * @returns {{x, y}}
 */
howso.CoordConvert.prototype.lnglat_to_mercator = function ( lng, lat ) {
    var merX = lng * 20037508.34 / 180;
    var merY = Math.log( Math.tan( ( 90 + lat ) * Math.PI / 360 ) ) / ( Math.PI / 180 );
    merY = merY * 20037508.34 / 180;
    return {
        x: merX,
        y: merY
    }
};


/**
 * mercator转lnglat
 * @param x
 * @param y
 * @returns {{lng, lat}}
 */
howso.CoordConvert.prototype.mercator_to_lnglat=function (x, y) {
    var lng = x / 20037508.34 * 180;
    var lat = y / 20037508.34 * 180;
    lat = 180 / Math.PI
        * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
    return {
        lng: lng,
        lat: lat
    }
};

/**
 * 计算点A到点B的距离
 * @param lngA
 * @param latA
 * @param lngB
 * @param latB
 * @returns {number}
 */
howso.CoordConvert.prototype.distance=function (lngA, latA, lngB, latB) {
    var earthR = 6371000;
    var x = Math.cos(latA * Math.PI / 180) * Math.cos(latB * Math.PI / 180) * Math.cos((lngA - lngB) * Math.PI / 180);
    var y = Math.sin(latA * Math.PI / 180) * Math.sin(latB * Math.PI / 180);
    var s = x + y;
    if (s > 1)
        s = 1;
    if (s < -1)
        s = -1;
    var alpha = Math.acos(s);
    var distance = alpha * earthR;
    return distance;
};

howso.CoordConvert.prototype._outOfChina=function (lng, lat) {
    if (lng < 72.004 || lng > 137.8347)
        return true;
    if (lat < 0.8293 || lat > 55.8271)
        return true;
    return false;
};

howso.CoordConvert.prototype.transformLat=function (x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this._PI) + 20.0 * Math.sin(2.0 * x * this._PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * this._PI) + 40.0 * Math.sin(y / 3.0 * this._PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * this._PI) + 320 * Math.sin(y * this._PI / 30.0)) * 2.0 / 3.0;
    return ret;
};

howso.CoordConvert.prototype.transformLng=function (x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this._PI) + 20.0 * Math.sin(2.0 * x * this._PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * this._PI) + 40.0 * Math.sin(x / 3.0 * this._PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * this._PI) + 300.0 * Math.sin(x / 30.0 * this._PI)) * 2.0 / 3.0;
    return ret;
};



howso.CoordConvert.prototype._delta=function (lng, lat) {
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    var dLat = this.transformLat(lng - 105.0, lat - 35.0);
    var dLng = this.transformLng(lng - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * this._PI;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this._PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this._PI);
    return { lng: dLng, lat: dLat };
};