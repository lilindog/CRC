import assert from "assert";
import CRC from "#CRC";
const data = new Uint8Array([ 0x01, 0x02 ]);
const appendData = (a, b, l) => {
    const d = new Uint8Array(a.byteLength + l);
    d.set(a, 0);
    let bytes = [];
    for (let i = l - 1; i > -1; i--) {
        bytes.push(b >>> i * 8);
    }
    d.set(bytes, a.byteLength);
    return d;
};

describe("CRC 单元测试", () => {
    describe("CRC16/USB", () => {
        const crc = new CRC(CRC.Types.crc16usb);
        let rd;
        it ("计算", done => {
            const crcCode = crc.calc(data);
            assert.deepStrictEqual(crcCode, 0x1e7e);
            rd = appendData(data, crcCode, 2);
            done();
        });
        it ("校验", done => {
            const r = crc.verify(rd);
            assert.deepStrictEqual(r, 0);
            done();
        });
    });
    describe("CRC16/XMODEM", () => {
        const crc = new CRC(CRC.Types.crc16xmodem);
        let rd;
        it ("计算", done => {
            const crcCode = crc.calc(data);
            assert.deepStrictEqual(crcCode, 0x1373);
            rd = appendData(data, crcCode, 2);
            done();
        });
        it ("校验", done => {
            const r = crc.verify(rd);
            assert.deepStrictEqual(r, 0);
            done();
        });
    });
    describe("CRC32", () => {
        const crc = new CRC(CRC.Types.crc32);
        let rd;
        it ("计算", done => {
            const crcCode = crc.calc(data);
            assert.deepStrictEqual(crcCode, 0xB6CC4292);
            rd = appendData(data, crcCode, 4);
            done();
        });
        it ("校验", done => {
            const r = crc.verify(rd);
            assert.deepStrictEqual(r, 0);
            done();
        });
    });
});