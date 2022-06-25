/**
 * @class
 * @classdesc CRC计算类
 * @author lilindog<lilin@lilin.site>
 */
class Crc {
    static CrcTypes = {
        crc32: {
            _crcWidth: 32,
            poly: 0x04c11db7,
            init: 0xffffffff,
            refin: true,
            refout: true,
            xorout: 0xffffffff,
            table: [

            ]
        }
    }
    static BinLength (num = 0x00) {
        let len = 0;
        while (num) {
            len++;
            num = num / 2 | 0;
        }
        return len;
    }
    static ReveseBin (value = 0x00, len = 0) {
        if (!len) {
            len = Crc.BinLength(value);
        }
        let out = 0, i = 0;
        for (; i < len; i++) {
            out <<= 1;
            out |= value >> i & 0x01;
        }
        return out;
    }
    type = null;
    constructor (type) {
        if (type === undefined || !Crc.CrcTypes[type]) {
            throw new Error("type 错误，type可选值为：[" + Reflect.ownKeys(Crc.CrcTypes).join("|") + "]");
        }
        this.type = type;
    }

    /**
     * 计算crc的方法111
     *
     * @param {Uint8Array} data - 需要计算crc的数据
     * @returns {Number} 返回crc吗
     * @public
     */
    calc (data) {
        const option = Crc.CrcTypes[this.type];
        let
            crc = option.init,
            poly = option.refin ? Crc.ReveseBin(option.poly, option._crcWidth) : option.poly;
        poly = poly < 0 ? poly + 0xffffffff + 1 : poly;
        for (let i = 0; i < data.byteLength; i++) {
            if (option.refin) {
                crc ^= data[i];
            } else {
                crc ^= data[i] << option._crcWidth - 8;
            }
            for (let j = 0; j < 8; j++) {
                if (option.refin) {
                    crc & 0x01 ?
                        crc = crc >>> 1 ^ poly :
                        crc >>>= 1;
                } else {
                    crc & 0x01 << option._crcWidth - 1 ?
                        crc = crc << 1 ^ poly :
                        crc <<= 1;
                }
            }
        }
        crc ^= option.xorout;
        crc = crc < 0 ? crc + 0xffffffff + 1 : crc;
        return option.refout ? Crc.ReveseBin(crc) : crc;
    }

    /**
     * 验证crc
     *
     * @param {Uint8Array} data
     * @returns {Boolean}
     * @public
     */
    verify (data) {
        let r = 0, i = 0, { poly, refin, _crcWidth : crcWidth } = Crc.CrcTypes[this.type];
        if (refin) poly = Crc.ReveseBin(poly);
        for (; i < data.byteLength; i++) {
            r ^= data[i];
            for (let j = 0; j < 8; j++) {
                if (refin) {
                    r & 0x01 ?
                        r ^= r >>> 1 ^ poly :
                        r >>>= 1;
                } else {
                    r & 0x01 << crcWidth - 1 ?
                        r = r << 1 ^ poly :
                        r <<= 1;
                }
            }
        }
        console.log(r.toString(2));
        return !Boolean(r);
    }
}