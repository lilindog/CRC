/**
 * 查表法的表资源
 * 使用查表法避免每字异或节位移计算，提升效率
 */
import {
    crc16usb,
    crc16xmodem,
    crc32
} from "./tables.mjs";

/**
 * 各种crc的参数模型
 */
const types = {
    crc32: {
        poly: 0x04c11db7,
        init: 0xffffffff,
        refin: true,
        refout: true,
        xorout: 0xffffffff,
        table: crc32
    },
    crc16usb: {
        poly: 0x8005,
        init: 0xffff,
        refin: true,
        refout: true,
        xorout: 0xffff,
        table: crc16usb
    },
    crc16xmodem: {
        poly: 0x1021,
        init: 0x0000,
        refin: false,
        refout: false,
        xorout: 0x0000,
        table: crc16xmodem
    }
};

const generateCountBin = count => {
    let res = 1;
    for (let i = 1; i < count; i++) {
        res <<= 1;
        res |= 1;
    }
    return res;
};

const getCrcWidth = poly => {
    const len = binLen(poly);
    let width = 0;
    /** 姑且最大32位宽 */
    for (let i = 0; i < 6; i++) {
        if (len < 2 ** i) {
            width = 2 ** i;
            break;
        }
    }
    if (width === 0) throw new Error(`[ getCrcWidth ] 计算出错`);
    return width;
};

const binLen = num => {
    let len = 0;
    while (num) {
        len++;
        num = num / 2 | 0;
    }
    return len;
};

const reverseBin = (value = 0x00, len = 0) => {
    if (!len) {
        len = binLen(value);
    }
    let out = 0, i = 0;
    for (; i < len; i++) {
        out <<= 1;
        out |= value >> i & 0x01;
    }
    return out;
};

/**
 * CRC计算类
 *
 * @class
 * @author lilindog<lilin@lilin.site>
 */
class CRC {
    static Types = Reflect.ownKeys(types).reduce((res, k) => (res[k] = k, res), {});

    #type;

    constructor (type = "") {
        const keys = Reflect.ownKeys(types);
        if (typeof type !== "string" || !keys.includes(type)) {
            throw new Error(`[ CRC ] 构造函数type参数错误，参考：${keys.join("|")}。`);
        }
        this.#type = type;
    }

    /**
     * 计算crc的方法111
     *
     * @param {Uint8Array} data - 需要计算crc的数据
     * @returns {Number} - 返回crc吗
     * @public
     */
    calc (data) {
        if (!(data instanceof Uint8Array)) {
            throw new Error(`[ CRC ] calc方法的data参数必须为Uint8Array`);
        }
        const
            option = types[this.#type],
            width = getCrcWidth(option.poly),
            mask = generateCountBin(width);
        let poly = option.poly;
        if (option.refin) {
            poly = reverseBin(poly, getCrcWidth(poly));
            if (poly < 0) {
                poly = poly + 0xffffffff + 1;
            }
        }

        let
            crc = option.init,
            byte,
            pos;
        for (byte of data) {
            if (option.refin) {
                crc = crc ^ byte;
                pos = crc & 0xff;
                crc = (crc >>> 8) ^ option.table[pos];
            } else {
                crc = crc ^ (byte << width - 8);
                pos = crc >> (width - 8) & 0xff;
                crc = crc << 8 ^ option.table[pos];
            }
        }
        crc = (crc ^ option.xorout) & mask;
        if (crc < 0) crc += 0xffffffff + 1;
        return crc;
    }

    /**
     * 验证crc
     *
     * @param {Uint8Array} data
     * @returns {Boolean}
     * @public
     */
    verify (data) {
        data = data.slice();
        const option = types[this.#type];
        const width = getCrcWidth(option.poly);
        if (option.refin) {
            let i, tmp = data.slice(data.length - (width / 8));
            for (i = tmp.length; i > 0; i--) {
                data.set([
                    /**
                     * 在refin为true的情况下，我先把crc校验码字节进行异或
                     * 这样方便些
                     */
                    tmp[i - 1] ^ option.init & 0xff
                ], data.length - i);
            }
        }
        let res = option.init, byte, poly = option.poly;
        if (option.refin) {
            poly = reverseBin(poly, width);
            if (poly < 0) poly = poly + 0xffffffff + 1;
        }
        for (byte of data) {
            if (option.refin) {
                res ^= byte;
                res = res >>> 8 ^ option.table[res & 0xff];
            } else {
                res ^= byte << width - 8;
                res = res << 8 ^ option.table[res >>> width - 8];
            }
        }
        res = res ^ option.xorout;
        return res ^ generateCountBin(width);
    }
}

export default CRC;