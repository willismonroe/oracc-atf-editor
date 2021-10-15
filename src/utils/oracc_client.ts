// @ts-ignore
import xmlrpc from 'xmlrpc';
// @ts-ignore
import {TextDecoder} from 'text-encoding';

function b64EncodeUnicode(str: string) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            // @ts-ignore
            return String.fromCharCode('0x' + p1);
        }));
}

// function b64DecodeUnicode(str: string) {
//     // Going backwards: from bytestream, to percent-encoding, to original string.
//     return decodeURIComponent(atob(str).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
// }
// @ts-ignore
const sendCommand = async function (server: string,
                                    command: string = "oracc.atf.check",
                                    filename: string,
                                    data: string): Promise<string | number> {
    const b64data = new Buffer(b64EncodeUnicode(data), 'base64')
    console.log("XML-RPC call:", server, command, filename, b64data)
    const client = xmlrpc.createClient({
        host: 'protected-hamlet-52907.herokuapp.com/oracc.ub.uni-muenchen.de',
        path: '/cgi-bin/rpc',
    })
    // @ts-ignore
    client.options.headers['password'] = 'oracc';
    return new Promise((resolve, reject) => {
        client.methodCall(command, [{
            'data': b64data,
            'atf-file-name': filename,
            'atf-args': 'cvm'
        }], (error: any, value: any) => {
            if (error) {
                console.log('error:', error);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
                resolve(0)
            } else {
                console.log('value:', value);
                if (typeof (value[2]) == "string") {
                    resolve(1)
                } else {
                    resolve(new TextDecoder("utf-8").decode(value[2]))
                }
            }
        })
    })

}

export {sendCommand}