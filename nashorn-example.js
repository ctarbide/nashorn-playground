/*  -*- mode: js; coding:utf-8-unix -*-
(progn
  (require 'ansi-color)
  (defun colorize-compilation-buffer ()
    (ansi-color-apply-on-region compilation-filter-start (point)))
  (add-hook 'compilation-filter-hook 'colorize-compilation-buffer))

(setq compile-command "mvn compile && ./nashorn-playground.sh -strict nashorn-example.js -- arg1 arg2")

(local-set-key (kbd "C-c C-c") 'recompile)
*/

var array_type = (function(global){
    "use strict";

    var array_types = {};

    function import_(m, n) {
        var res = Java.type(m);
        if (/\[\]$/.test(m)) {
            array_types[(new res(0)).getClass().getName()] = res;
        }
        return global[n || m.split(/\./).pop()] = res;
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

    import_('com.acme.labs.Example');

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

function bytes_from_hex(val) {
    if (val instanceof JavaLangString) {
        return Hex['decodeStrict(String)'](val);
    }
    if (val instanceof ByteArray) {
        return Hex['decode(byte[])'](val);
    }
    if (val instanceof Uint8Array) {
        throw 'TODO';
    }
    throw new RuntimeException('exhaustion');
}

var LOG = LogManager['getLogger(String)'](__FILE__);

// Security.addProvider(new BouncyCastleProvider());
Security.insertProviderAt(new BouncyCastleProvider(), 1);

/* play time
 */

System.out.println(Example.getValue());
print(Example.getValue());

LOG.trace("testing: {}", 'trace message');
LOG.debug("testing: {}", 'debug message');
LOG.info("testing: {}", 'info message');
LOG.warn("testing: {}", 'warn message');

Array.prototype.slice.call(arguments).forEach(function(v, idx){
    LOG.debug("arg[{}]: {}", idx|0, v);
});

// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
(function(){
    function list() {
        return Array.prototype.slice.call(arguments);
    }

    var list1 = list(1, 2, 3); // [1, 2, 3]
    LOG.debug('list1: {}', Java.to(list1));
}());

// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
(function(){
    var unboundSlice = Array.prototype.slice;
    var slice = Function.prototype.call.bind(unboundSlice);

    function list() {
        return slice(arguments);
    }

    var list1 = list(1, 2, 3); // [1, 2, 3]
    LOG.debug('list1: {}', Java.to(list1));
}());
