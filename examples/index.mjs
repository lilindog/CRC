import CRC from "#CRC";

const crc = new CRC("crc16xmodem");

const res = crc.calc(new Uint8Array([ 0x01, 0x02 ]));
console.log(res.toString(16));
const byteLen = 2;
const bytes = Array(byteLen).fill().reduce((...[ bytes,,index ]) => {
    bytes.push(res >>>  ((byteLen - index - 1) * 8));
    return bytes;
}, []);
const data = new Uint8Array([ 0x01, 0x02, ...bytes ]);
console.log(data);
console.log(crc.verify(data));
