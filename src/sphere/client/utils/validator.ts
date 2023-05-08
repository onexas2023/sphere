/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { I18n } from '@onexas/sphere/client/types';
import {
    isNullUndef,
    typeOfBoolean,
    typeOfNumber,
    typeOfString,
} from '@onexas/sphere/client/utils/object';

export class Validator {
    msgBean: any;
    i18n: I18n;
    validFields = new Set<string>();
    invalidFields = new Set<string>();
    invalid: boolean = false;
    constructor(msgBean: any, i18n?: I18n) {
        this.msgBean = msgBean;
        this.i18n = i18n;
    }

    invalidate(field: string, msg?: string) {
        this.validate(new TrueValidate({ msg }), false, field);
    }

    validate<T>(
        validate: Validate<T> | Validate<T>[],
        value: T,
        field: string,
        whenValid = true
    ): boolean {
        if (whenValid && this.isInvalid(field)) {
            return false;
        }
        const { i18n } = this;
        let invalides;
        if (Array.isArray(validate)) {
            invalides = new GroupValidate(...validate).validate(value);
        } else {
            invalides = validate.validate(value);
        }

        const v = isValid(invalides);

        if (v) {
            this.msgBean[field] = null;
        } else {
            this.msgBean[field] = toMessages(invalides, i18n);
        }
        if (v) {
            this.validFields.add(field);
            this.invalidFields.delete(field);
        } else {
            this.validFields.delete(field);
            this.invalidFields.add(field);
        }
        return v;
    }

    clear(...fields: string[]) {
        for (const field of fields) {
            this.msgBean[field] = null;
            this.validFields.delete(field);
            this.invalidFields.delete(field);
        }
    }

    reset() {
        this.invalidFields.forEach((field) => {
            this.msgBean[field] = null;
        });
        this.validFields.clear();
        this.invalidFields.clear();
        this.invalid = false;
    }

    anyValid() {
        return this.validFields.size > 0;
    }

    anyInvalid() {
        return this.invalidFields.size > 0;
    }

    isInvalid(field: string) {
        return this.invalidFields.has(field);
    }
}

export interface Validate<T> {
    validate(value: T): null | Invalid | Invalid[];
}

export type Invalid = {
    msg: string;
    params?: any;
};

export class GroupValidate implements Validate<any> {
    validates: Validate<any>[] = [];

    constructor(...validates: Validate<any>[]) {
        this.add(...validates);
    }

    add(...validates: Validate<any>[]) {
        if (validates && validates.length > 0) {
            this.validates.push(...validates);
        }
    }

    validate(value: any) {
        const invalids: Invalid[] = [];
        const { validates } = this;
        validates.forEach((v) => {
            const inv = v.validate(value);
            if (inv !== null) {
                if (Array.isArray(inv)) {
                    invalids.push(...inv);
                } else {
                    invalids.push(inv);
                }
            }
        });
        return invalids;
    }
}

export function isValid(invalides: null | Invalid | Invalid[]): boolean {
    return !invalides || (Array.isArray(invalides) && invalides.length === 0);
}

export function toMessages(invalides: null | Invalid | Invalid[], i18n?: I18n): string {
    if (!invalides) {
        return '';
    }
    const msgs: string[] = [];
    if (Array.isArray(invalides)) {
        invalides.forEach((inv) => {
            msgs.push(i18n ? i18n.l(inv.msg, inv.params) : inv.msg);
        });
    } else {
        const inv = invalides;
        msgs.push(i18n ? i18n.l(inv.msg, inv.params) : inv.msg);
    }

    return msgs.join(', ');
}

export type TrueValidateOption = {
    strict?: boolean;
    msg?: string;
};

export class TrueValidate implements Validate<boolean> {
    opt: TrueValidateOption;

    constructor(opt?: TrueValidateOption) {
        this.opt = { strict: true, ...opt };
    }

    validate(value: boolean) {
        const invalids: Invalid[] = [];
        const { strict, msg = 'validator.invalid' } = this.opt;
        if (strict ? value !== true : !value) {
            invalids.push({
                msg,
            });
        }
        return invalids;
    }
}

export type RequiredValidateOption = {
    strict?: boolean;
    msg?: string;
};
export class RequiredValidate implements Validate<any> {
    opt: RequiredValidateOption;

    constructor(opt?: RequiredValidateOption) {
        this.opt = { strict: true, ...opt };
    }

    validate(value: any) {
        const invalids: Invalid[] = [];
        const { strict, msg = 'validator.required' } = this.opt;
        if (strict ? isNullUndef(value) : !value) {
            invalids.push({
                msg,
            });
        }
        return invalids;
    }
}

export const Reuqired = new RequiredValidate({ strict: true });
export const ReuqiredNotStrict = new RequiredValidate({ strict: false });

export type BoolValidateOption = {
    bool: boolean;
    strict?: boolean;
    msg?: string;
};
export class BoolValidate implements Validate<boolean> {
    opt: BoolValidateOption;
    constructor(opt?: BoolValidateOption) {
        this.opt = { strict: true, ...opt };
    }

    validate(value: boolean) {
        const invalids: Invalid[] = [];
        const { bool, strict } = this.opt;
        let { msg } = this.opt;
        if (strict && !typeOfBoolean(value)) {
            msg = msg ? msg : 'validator.bool.type';
        } else if (strict ? bool !== null && bool !== value : bool !== !!value) {
            msg = msg ? msg : 'validator.bool.value';
        } else {
            return invalids;
        }
        invalids.push({
            msg,
            params: { bool },
        });
        return invalids;
    }
}

export type RegExpValidateOption = {
    regExp: RegExp;
    msg?: string;
};
export class RegExpValidate implements Validate<string> {
    opt: RegExpValidateOption;
    constructor(opt?: RegExpValidateOption) {
        this.opt = { ...opt };
    }

    validate(value: string) {
        const invalids: Invalid[] = [];
        const { regExp } = this.opt;
        let { msg } = this.opt;
        if (!regExp.test(value)) {
            msg = msg ? msg : 'validator.regexp.value';
        } else {
            return invalids;
        }
        invalids.push({
            msg,
            params: { regexp: regExp.source },
        });
        return invalids;
    }
}

export type EmailValidateOption = {
    msg?: string;
};
export class EmailValidate extends RegExpValidate {
    constructor(opt?: EmailValidateOption) {
        super({
            regExp: /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
            msg: 'validator.email',
            ...opt,
        });
    }
}

export const Email = new EmailValidate();

export type NumberValidateOption = {
    min?: number;
    max?: number;
    msg?: string;
};

export class NumberValidate implements Validate<number> {
    opt: NumberValidateOption;

    constructor(opt: NumberValidateOption) {
        this.opt = { ...opt };
    }

    validate(value: number) {
        const invalids: Invalid[] = [];
        if (value !== null && value !== undefined) {
            const { min = null, max = null } = this.opt;
            let { msg } = this.opt;
            if (!typeOfNumber(value) || isNaN(value)) {
                msg = msg ? msg : 'validator.number.type';
            } else if (min !== null && max !== null && (value < min || value > max)) {
                msg = msg ? msg : 'validator.number.between';
            } else if (min !== null && value < min) {
                msg = msg ? msg : 'validator.number.min';
            } else if (max !== null && value > max) {
                msg = msg ? msg : 'validator.number.max';
            } else {
                return invalids;
            }
            invalids.push({
                msg,
                params: { min, max },
            });
        }
        return invalids;
    }
}

export type LengthValidateOption = {
    min?: number;
    max?: number;
    msg?: string;
};
export class LengthValidate implements Validate<string | any[]> {
    opt: LengthValidateOption;

    constructor(opt: LengthValidateOption) {
        this.opt = { ...opt };
    }

    validate(value: string | any[]) {
        const invalids: Invalid[] = [];
        if (value !== null && value !== undefined) {
            const { min = null, max = null } = this.opt;
            let { msg } = this.opt;
            let length: number;
            if (typeOfString(value)) {
                length = value.length;
            } else if (Array.isArray(value)) {
                length = (value as any[]).length;
            } else {
                msg = msg ? msg : 'validator.length.type';
                invalids.push({
                    msg,
                    params: { min, max },
                });
                return invalids;
            }

            if (min !== null && max !== null && (length < min || length > max)) {
                msg = msg ? msg : 'validator.length.between';
            } else if (min !== null && length < min) {
                msg = msg ? msg : 'validator.length.min';
            } else if (max !== null && length > max) {
                msg = msg ? msg : 'validator.length.max';
            } else {
                return invalids;
            }
            invalids.push({
                msg,
                params: { min, max },
            });
        }
        return invalids;
    }
}

export class StringLengthValidate implements Validate<string | any[]> {
    opt: LengthValidateOption;

    constructor(opt: LengthValidateOption) {
        this.opt = { ...opt };
    }

    validate(value: string | any[]) {
        const invalids: Invalid[] = [];
        if (value !== null && value !== undefined) {
            const { min = null, max = null } = this.opt;
            let { msg } = this.opt;
            let length: number;
            if (typeOfString(value)) {
                length = value.length;
            } else {
                msg = msg ? msg : 'validator.length.type-string';
                invalids.push({
                    msg,
                    params: { min, max },
                });
                return invalids;
            }

            if (min !== null && max !== null && (length < min || length > max)) {
                msg = msg ? msg : 'validator.length.between';
            } else if (min !== null && length < min) {
                msg = msg ? msg : 'validator.length.min';
            } else if (max !== null && length > max) {
                msg = msg ? msg : 'validator.length.max';
            } else {
                return invalids;
            }
            invalids.push({
                msg,
                params: { min, max },
            });
        }
        return invalids;
    }
}
