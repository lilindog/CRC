# CRC 计算库

从另一个项目抽离出来的。  

---

## 🔨 API
1. class CRC   
    计算crc的类，实例化时传入crc type，crc type参见CRC.Types。

2. CRC.prototype.calc()   
    计算数据的crc码。   
    函数签名：`(Uint8Array) => Number`。      

3. CRC.prototype.verify()
    校验数据的crc码。    
    函数签名：`(Uint8Array) => Number`。   

示例： 
```js
import CRC from "#CRC";

const appendData = (data, crcCode, crcByteCount) => {
    const d = new Uint8Array(a.byteLength + l);
    d.set(a, 0);
    let bytes = [];
    for (let i = l - 1; i > -1; i--) {
        bytes.push(b >>> i * 8);
    }
    d.set(bytes, a.byteLength);
    return d;
};

const crc = new CRC("crc16xmodem");
const data = new Uint8Array([ 0x01, 0x02 ]);

const crcCode = crc.calc(data);
console.log("crccode：" + crcCode);
const crcData = appendData(data, crcCode, 2);
console.log(crc.verify(crcData));

```

