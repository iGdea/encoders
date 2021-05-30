const spCharCodes = '[\\u0000-\\u001F]|\\u00F1|\\u000B|\\u000C|\\u00A0|\\uFEFF|\\u1680|\\u180E|[\\u2000-\\u200F]|\\u2028|\\u2029|\\u202F|\\u205F|\\u3000';


function getStrValue(str: any): string {
    if (str === null || str === undefined || typeof str == 'function') {
        str = '';
    } else {
        str += '';
    }

    return str;
}

type EscapeMap = {
    [word: string]: string
};

const HtmlEscapeMap: EscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
    '\\': '&#92;',
};


export const htmlEncode = (function() {
    const escapeMap = {
        ...HtmlEscapeMap,
    };

    const reg = new RegExp(Object.keys(escapeMap).join('|'), 'g');

    function rp(all: string) {
        return escapeMap[all] || '';
    }

    return function(str: any): string {
        str = getStrValue(str);
        if (!str) return str;

        return str.replace(reg, rp);
    };
})();


export const jsEncode = (function () {
    // 可以再添加一个\/ 主要是防止// 或则/**/这些组合注释 (有一个地方没有encode，可能会导致一片代码被波及)
    const escapeMap: EscapeMap = {
        '\n': '\\n',
        '\r': '\\r',
        '\\': '\\\\',

        '/': '\\/',
        '"': '\\"',
        "'": "\\'",
        '>': '\\>',
        // 增加> | < 防止在script标签中，中xss
        '<': '\\u003c',

        '`': '\\`',
    };

    const reg = new RegExp(Object.keys(escapeMap).join('|') + '|' + spCharCodes, 'g');

    function rp(str: string) {
        return escapeMap[str] || '\\u' + str.charCodeAt(0).toString(16).padStart(4, '0');
    }

    return function(str: any): string {
        str = getStrValue(str);
        if (!str) return str;

        return str.replace(reg, rp);
    };
})();

export function urlEncode(str: any): string {
    str = getStrValue(str);
    if (!str) return str;

    return encodeURIComponent(str);
}


export const jsonStringify = (function() {
    const scriptTagReg = /</g;

    return function(data: any, replacer?: any, space?: string): string {
        const result = JSON.stringify(data, replacer, space);
        if (!result) return '';

        // 防</script> xss
        // 由于stringify本身就会对里面的数据进行一些encode
        // 而且都是jsEncode类型，所以不担心htmlEncode分支
        return result.replace(scriptTagReg, '\\u003c');
    };
})();


export const input2html = (function() {
    const escapeMap: EscapeMap = {
        ...HtmlEscapeMap,

        ' ': '&nbsp;',
        '\n': '<br/>',
        '\r': '',
    };

    const reg = new RegExp(Object.keys(escapeMap).join('|') + '|' + spCharCodes, 'g');

    function rp(all: string) {
        return escapeMap[all] || '&#' + all.charCodeAt(0) + ';';
    }

    return function(str: any): string {
        str = getStrValue(str);
        if (!str) return str;

        return str.replace(reg, rp);
    };
})();
