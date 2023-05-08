/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable no-undef  */
import 'jsdom-global/register';
import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import renderer from 'react-test-renderer';
import { UITestSample } from '@onexas/sphere/client/components/UITestSample';

describe('UITestSample Component', () => {
    let component: ReactWrapper;
    const msg: string = 'UITestSample Test Message';
    console.log(">>A", component);
    beforeEach(() => {
        component = mount(<UITestSample message={msg} />);
    });

    it('render whole component matches snapshot', () => {
        const component = renderer.create(<UITestSample message={msg} />);
        const json = component.toJSON();
        expect(json).toMatchSnapshot();
    });

    it(`title will render ${msg}`, () => {
        expect(component.find('div').text()).toEqual(msg);
    });
});
