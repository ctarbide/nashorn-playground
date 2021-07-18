/*  -*- mode: js; coding:utf-8-unix -*-
(progn
  (require 'ansi-color)
  (defun colorize-compilation-buffer ()
    (ansi-color-apply-on-region compilation-filter-start (point)))
  (add-hook 'compilation-filter-hook 'colorize-compilation-buffer))

(setq compile-command "./totp.sh --algo=sha1 --step=30 -d=6 -k- JBSWY3DPEHPK3PXP -b -xyz")

(local-set-key (kbd "C-c C-c") 'recompile)
*/

// reference: https://datatracker.ietf.org/doc/html/rfc6238
// reference: http://jsfiddle.net/russau/ch8PK

var array_type = (function(global){
    "use strict";

    var array_types = {};

    function import_(m, n) {
        var res = Java.type(m);
        var sym = n || m.split(/\./).pop();
        if (/\[\]$/.test(m)) {
            array_types[(new res(0)).getClass().getName()] = res;
        }
        if (global[sym]) {
            throw 'error: symbol already defined: "' + sym + '"';
        }
        return global[sym] = res;
    }

    import_('java.lang.AssertionError');
    import_('java.lang.IllegalArgumentException');
    import_('java.lang.Long');
    import_('java.lang.Object', 'JavaLangObject');
    import_('java.lang.RuntimeException');
    import_('java.lang.String', 'JavaLangString');
    import_('java.lang.System');
    import_('java.nio.ByteBuffer');
    import_('java.nio.charset.StandardCharsets');
    import_('java.security.MessageDigest');
    import_('java.security.Security');
    import_('java.util.Arrays');
    import_('org.apache.commons.codec.binary.Base32');
    import_('org.apache.logging.log4j.LogManager');
    import_('org.bouncycastle.crypto.Digest');
    import_('org.bouncycastle.crypto.digests.SHA1Digest');
    import_('org.bouncycastle.crypto.digests.SHA256Digest');
    import_('org.bouncycastle.crypto.digests.SHA512Digest');
    import_('org.bouncycastle.crypto.macs.HMac');
    import_('org.bouncycastle.crypto.params.KeyParameter');
    import_('org.bouncycastle.jce.provider.BouncyCastleProvider');
    import_('org.bouncycastle.util.encoders.Hex');

    import_('byte[]', 'ByteArray');
    import_('char[]', 'CharArray');
    import_('double[]', 'DoubleArray');
    import_('float[]', 'FloatArray');
    import_('int[]', 'IntArray');
    import_('java.lang.Object[]', 'ObjectArray');
    import_('long[]', 'LongArray');
    import_('short[]', 'ShortArray');

    return function array_type(b) {
        return array_types[b.getClass().getName()];
    };
}(this));

function assert(test) {
    if (!test) {
        throw new AssertionError();
    }
}

(function(){
    assert(array_type(new ByteArray(0)) === ByteArray);
    assert(array_type(new ObjectArray(0)) === ObjectArray);
}());

function last(val) {
    if (val instanceof Array) {
        // js arrays are also java objects
        return val[val.length - 1];
    }
    if (val instanceof JavaLangObject) {
        if (val.getClass().isArray()) {
            return val[val.length - 1];
        }
    }
    throw new RuntimeException('exhaustion');
}

function equal(a, b) {
    if (a instanceof JavaLangObject) {
        if (b instanceof JavaLangObject) {
            var aClass = a.getClass();
            var bClass = b.getClass();
            if (aClass === bClass && aClass.isArray()) {
                return Arrays.equals(a, b);
            }
            return a.equals(b);
        }
        return false;
    }
    return a == b;
}

(function(){
    assert(equal(Java.to(["hello", "world", "!"]), Java.to(['hello', 'world', '!'])));
    assert(equal(Java.to([1, 2, 3],'byte[]'), Java.to([1, 2, 3], ByteArray)));
    assert(equal(Java.to([1, 2, 3],'short[]'), Java.to([1, 2, 3], ShortArray)));
    assert(equal(Java.to([1, 2, 3],'char[]'), Java.to([1, 2, 3], CharArray)));
    assert(equal(Java.to([1, 2, 3],'int[]'), Java.to([1, 2, 3], IntArray)));
    assert(equal(Java.to([1, 2, 3],'long[]'), Java.to([1, 2, 3], LongArray)));
    assert(equal(Java.to([1, 2, 3],'double[]'), Java.to([1, 2, 3], DoubleArray)));
    assert(equal(Java.to([1, 2, 3],'float[]'), Java.to([1, 2, 3], FloatArray)));
}());

function bytes(val) {
    if (val instanceof JavaLangString) {
        return val.getBytes(StandardCharsets.UTF_8);
    }
    if (val instanceof ByteArray) {
        return val;
    }
    if (val instanceof Uint8Array) {
        throw 'TODO: convert to ByteArray';
    }
    throw new RuntimeException('exhaustion');
}

// result: ByteArray
function bytes_from_array_like(al) {
    var i = 0;
    var ilen = al.length;
    var res = new ByteArray(ilen);
    var v;
    for (;i<ilen;i++) {
        v = al[i];
        if ((typeof v) !== 'number') {
            return undefined;
        }
        if (v < 0) {
            return undefined;
        }
        res[i] = v | 0;
    }
    return res;
}

// result: ByteArray
function bytes_from_arguments() {
    return bytes_from_array_like(arguments);
}

function hex(val) {
    if (val instanceof ByteArray) {
        return Hex['toHexString(byte[])'](val);
    }
    if (val instanceof Uint8Array) {
        throw 'TODO';
    }
    throw new RuntimeException('exhaustion');
}

function string(val, charset) {
    if (val instanceof ByteArray) {
        return new JavaLangString['(byte[],java.nio.charset.Charset)'](val, charset);
    }
    if (val instanceof CharArray) {
        return new JavaLangString['(char[])'](val);
    }
    if (val instanceof Uint8Array) {
        throw 'TODO';
    }
    throw new RuntimeException('exhaustion');
}

function utf8(val) {
    return string(val, StandardCharsets.UTF_8);
}

function ascii(val) {
    return string(val, StandardCharsets.US_ASCII);
}

// key and data: ByteArray, result: ByteArray
function hmac(type, key, data) {
    var inst = new HMac(new type());
    inst.init(new KeyParameter(key));
    inst.update(data, 0, data.length);
    var res = new ByteArray(inst.getMacSize());
    inst.doFinal(res, 0);
    return res;
}

function hmac_sha1(key, data) {
    return hmac(SHA1Digest, key, data);
}

// result: ByteArray
function bytes_from_hex(val) {
    if (val instanceof JavaLangString) {
        return Hex['decodeStrict(java.lang.String)'](val);
    }
    if (val instanceof ByteArray) {
        return Hex['decode(byte[])'](val);
    }
    if (val instanceof Uint8Array) {
        throw 'TODO';
    }
    throw new RuntimeException('exhaustion');
}

function bytes_from_base32(val) {
    if (val instanceof JavaLangString) {
        return (new Base32())['decode(java.lang.String)'](val);
    }
    throw new RuntimeException('exhaustion');
}

var __FILE__basename = __FILE__.replace(/^.*\//, '');
var LOG = LogManager['getLogger(java.lang.String)'](__FILE__basename);

// Security.addProvider(new BouncyCastleProvider());
Security.insertProviderAt(new BouncyCastleProvider(), 1);

/* tests
 */

function totp_hmac_data(t) {
    return ByteBuffer.allocate(8).putLong(t).array();
}

function totp(digest, key, step, digits, t0, secs){
    "use strict";
    digits |= 0;
    if (digits < 6 || digits > 9) {
        return null;
    }
    if (secs < t0) {
        return null;
    }
    var h = hmac(digest, key, totp_hmac_data(((secs - t0) / step)));
    var hbb = ByteBuffer['wrap(byte[])'](h);
    var index = last(h) & 0xf;
    var value = hbb.getInt(index) & 0x7fffffff;
    return ('00000000' + value).slice(-digits);
}

var short_option_name = {
    'k': 'key',
    'd': 'digits',
    't': 'time',
    'x': 'xray',
    'y': 'yankee',
    'z': 'zulu',
};

function parse_args(args) {
    "use strict";
    var res = {argv: [], options: {}};
    var i, ilen = args.length;
    var match;
    for (i=0; i<ilen; i++) {
        if (match = /^--(.*?)=(.*)/.exec(args[i])) {
            res.options[match[1]] = match[2];
        } else if (match = /^--(.*?)-$/.exec(args[i])) {
            res.options[match[1]] = args[++i];
        } else if (match = /^--(.*?)$/.exec(args[i])) {
            res.options[match[1]] = true;
        } else if (match = /^-(\w)=(.*)/.exec(args[i])) {
            res.options[short_option_name[match[1]] || match[1]] = match[2];
        } else if (match = /^-(\w)-$/.exec(args[i])) {
            res.options[short_option_name[match[1]] || match[1]] = args[++i];
        } else if (match = /^-(\w+)$/.exec(args[i])) {
            var j, jlen = match[1].length;
            for (j=0; j<jlen; j++) {
                var letter = match[1].charAt(j);
                res.options[short_option_name[letter] || letter] = true;
            }
        } else {
            res.argv.push(args[i]);
        }
    }
    return res;
}

(function(args){
    "use strict";
    var algos = {
        'sha1': SHA1Digest,
        'sha256': SHA256Digest,
        'sha512': SHA512Digest,
    };
    if ((typeof args.options.key) !== 'string') {
        throw 'error: missing key'
    }
    if (args.options.showargs) {
        LOG.debug("args: {}", JSON.stringify(args, null, 4));
    }
    var token = totp(
        args.options.algo ? algos[args.options.algo] : SHA1Digest,
        bytes_from_base32(args.options.key),
        args.options.step ? parseInt(args.options.step) : 30 /* step */,
        args.options.digits ? parseInt(args.options.digits) : 8 /* digits */,
        args.options.t0 ? parseInt(args.options.t0) : 0 /* t0 */,
        args.options.time ? parseInt(args.options.time) : Date.now() / 1000
    );
    print(token);
}(parse_args(arguments)));
