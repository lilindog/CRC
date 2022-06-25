import CRC from "#CRC";

const crc = new CRC("crc32");

const res = crc.calc(new Uint8Array([ 0x01, 0x02 ]));
console.log(res.toString(16));
const bytes = Array(4).fill().reduce((...[ bytes,,index ]) => {
    console.log(index);
    bytes.push(res >>>  ((4 - index - 1) * 8));
    return bytes;
}, []);
const data = new Uint8Array([ 0x01, 0x02, ...bytes ]);
console.log(data);
console.log(crc.verify(data));
