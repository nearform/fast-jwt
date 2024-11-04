"use strict";
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const tsd_1 = require("tsd");
// Signing
// Buffer key, both async/callback styles
const signerSync = (0, __1.createSigner)({ key: Buffer.from('KEY'), algorithm: 'RS256' });
signerSync({ key: '1' });
const signerAsync = (0, __1.createSigner)({ key: () => Buffer.from('KEY'), algorithm: 'RS256' });
signerAsync({ key: '1' }).then(console.log, console.log);
signerAsync({ key: '1' }, (_e, _token) => { });
// Dynamic key in callback style
(0, __1.createSigner)({
    clockTimestamp: 10,
    key(_decodedJwt, cb) {
        cb(null, 'KEY');
    }
})({ key: 1 }).then(console.log, console.log);
// Dynamic key in async style
(0, __1.createSigner)({
    clockTimestamp: 10,
    async key(_decodedJwt) {
        return 'KEY';
    }
})({ key: 1 }).then(console.log, console.log);
// expiresIn as a string
(0, __1.createSigner)({
    expiresIn: '10min',
    key: Buffer.from('KEY'),
    algorithm: 'RS256'
});
// Decoding
const decoder = (0, __1.createDecoder)({ checkTyp: 'true' });
decoder('FOO');
decoder(Buffer.from('FOO'));
// Verifying
// String key, both async/callback styles
const verifierSync = (0, __1.createVerifier)({ key: 'KEY', algorithms: ['RS256'], requiredClaims: ['aud'], checkTyp: 'JWT' });
verifierSync('2134');
const verifierAsync = (0, __1.createVerifier)({ key: () => 'KEY', algorithms: ['RS256'] });
verifierAsync('123').then(console.log, console.log);
verifierAsync(Buffer.from('456'), (_e, _token) => { });
// Dynamic key in callback style
(0, __1.createVerifier)({
    clockTimestamp: 10,
    key(_decodedJwt, cb) {
        cb(null, 'KEY');
    }
})('123').then(console.log, console.log);
// Dynamic key in async style
(0, __1.createVerifier)({
    clockTimestamp: 10,
    async key(decodedJwt) {
        if (decodedJwt.payload.iss) {
            return 'ISS_KEY';
        }
        return 'KEY';
    }
})('456').then(console.log, console.log);
// Errors
const wrapped = __1.TokenError.wrap(new Error('ORIGINAL'), 'FAST_JWT_INVALID_TYPE', 'MESSAGE');
wrapped.code === 'FAST_JWT_INVALID_TYPE';
wrapped.message === 'MESSAGE';
Array.isArray(wrapped.stack);
wrapped.originalError.message === 'ORIGINAL';
const signerOptions = {
    header: {
        alg: 'RS256',
        typ: '',
        cty: '',
        crit: [''],
        kid: '',
        jku: '',
        x5u: '',
        'x5t#S256': '',
        x5t: '',
        x5c: ''
    }
};
(0, tsd_1.expectAssignable)(signerOptions.header);
const signerOptionsCustomHeaders = {
    header: {
        alg: 'RS256',
        typ: '',
        cty: '',
        crit: [''],
        kid: '',
        jku: '',
        x5u: '',
        'x5t#S256': '',
        x5t: '',
        x5c: '',
        customClaim: 'my-custom-claim',
        customClaim2: 'my-custom-claim2'
    }
};
(0, tsd_1.expectAssignable)(signerOptionsCustomHeaders.header);
const signerOptionsNoAlg = {
    header: {
        typ: '',
        cty: '',
        crit: [''],
        kid: '',
        jku: '',
        x5u: '',
        'x5t#S256': '',
        x5t: '',
        x5c: ''
    }
};
(0, tsd_1.expectNotAssignable)(signerOptionsNoAlg.header);
// Check all errors are typed correctly
(0, tsd_1.expectType)(Object.values(__1.TokenError.codes));
