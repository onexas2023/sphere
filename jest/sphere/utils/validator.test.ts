/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable no-undef  */
import {
    BoolValidate,
    LengthValidate,
    NumberValidate,
    RequiredValidate,
    TrueValidate,
    Validator,
} from '@onexas/sphere/client/utils/validator';

describe('utils/validator test', () => {
    it('test TrueValidate', () => {
        const msgBean: any = {};
        const validator = new Validator(msgBean);

        let r = validator.validate(new TrueValidate(), true, 'x');
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new TrueValidate(), false, 'y');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBe('validator.invalid');

        r = validator.validate(new TrueValidate({ msg: 'Invalid' }), false, 'z');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBe('validator.invalid');
        expect(msgBean.z).toBe('Invalid');

        validator.reset();
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBeNull();
        expect(msgBean.z).toBeNull();
    });
    it('test BoolValidate', () => {
        const msgBean: any = {};
        const validator = new Validator(msgBean);

        let r = validator.validate(new BoolValidate({ bool: true }), true, 'x');
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new BoolValidate({ bool: true }), false, 'y');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBe('validator.bool.value');

        r = validator.validate(new BoolValidate({ bool: false, msg: 'Invalid' }), true, 'z');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBe('validator.bool.value');
        expect(msgBean.z).toBe('Invalid');
    });
    it('test RequiredValidate', () => {
        const msgBean: any = {};
        const validator = new Validator(msgBean);

        let r = validator.validate(new RequiredValidate(), '', 'x');
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new RequiredValidate(), null, 'y');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBe('validator.required');

        r = validator.validate(new RequiredValidate({ msg: 'Required' }), null, 'z');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBeNull();
        expect(msgBean.y).toBe('validator.required');
        expect(msgBean.z).toBe('Required');

        validator.reset();

        r = validator.validate(new RequiredValidate({ strict: false }), '', 'x');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.required');

        r = validator.validate(new RequiredValidate({ strict: false }), 0, 'x');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.required');
    });
    it('test NumberValidate', () => {
        const msgBean: any = {};
        const validator = new Validator(msgBean);

        let r = validator.validate(new NumberValidate({ min: 3, max: 10 }), '5' as any, 'x');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.number.type');

        r = validator.validate(new NumberValidate({ min: 3 }), 3, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new NumberValidate({ min: 3 }), 4, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new NumberValidate({ min: 3 }), 2, 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.number.min');

        r = validator.validate(new NumberValidate({ max: 3 }), 3, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new NumberValidate({ max: 3 }), 2, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new NumberValidate({ max: 3 }), 4, 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.number.max');

        r = validator.validate(new NumberValidate({ min: 3, max: 5 }), 3, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new NumberValidate({ min: 3, max: 5 }), 4, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new NumberValidate({ min: 3, max: 5 }), 5, 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new NumberValidate({ min: 3, max: 5 }), 2, 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.number.between');
        r = validator.validate(new NumberValidate({ min: 3, max: 5 }), 6, 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.number.between');
    });

    it('test LengthValidate of String', () => {
        const msgBean: any = {};
        const validator = new Validator(msgBean);

        let r = validator.validate(new LengthValidate({ min: 3, max: 10 }), {} as any, 'x');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.type');

        r = validator.validate(new LengthValidate({ min: 3 }), 'aaa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ min: 3 }), 'aaaa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        validator.reset();

        r = validator.validate(new LengthValidate({ min: 3 }), 'aa', 'x');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.min');

        r = validator.validate(new LengthValidate({ max: 3 }), 'aaa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ max: 3 }), 'aa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ max: 3 }), 'aaaa', 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.max');

        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aaa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aaaa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aaaaa', 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aa', 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.between');
        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aaaaaa', 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.between');
    });

    it('test LengthValidate of array', () => {
        const msgBean: any = {};
        const validator = new Validator(msgBean);

        let r = validator.validate(new LengthValidate({ min: 3, max: 10 }), {} as any, 'x');
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.type');

        r = validator.validate(new LengthValidate({ min: 3 }), 'aaa'.split(''), 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ min: 3 }), 'aaaa'.split(''), 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ min: 3 }), 'aa'.split(''), 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.min');

        r = validator.validate(new LengthValidate({ max: 3 }), 'aaa'.split(''), 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ max: 3 }), 'aa'.split(''), 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        expect(msgBean.x).toBeNull();

        r = validator.validate(new LengthValidate({ max: 3 }), 'aaaa'.split(''), 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.max');

        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aaa'.split(''), 'x', false);
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(
            new LengthValidate({ min: 3, max: 5 }),
            'aaaa'.split(''),
            'x',
            false
        );
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(
            new LengthValidate({ min: 3, max: 5 }),
            'aaaaa'.split(''),
            'x',
            false
        );
        expect(r).toBe(true);
        expect(validator.anyValid()).toBe(true);
        expect(validator.anyInvalid()).toBe(false);
        r = validator.validate(new LengthValidate({ min: 3, max: 5 }), 'aa'.split(''), 'x', false);
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.between');
        r = validator.validate(
            new LengthValidate({ min: 3, max: 5 }),
            'aaaaaa'.split(''),
            'x',
            false
        );
        expect(r).toBe(false);
        expect(validator.anyValid()).toBe(false);
        expect(validator.anyInvalid()).toBe(true);
        expect(msgBean.x).toBe('validator.length.between');
    });
});
