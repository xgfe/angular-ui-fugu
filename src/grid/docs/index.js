import script from './script';

import rawScript from '!!raw-loader!./script';

import indexTemplate from './index.html';
export const name = 'grid';
export const cnName = '栅格';
export { default as readme } from './readme.md';

export const demos = {
    basic: {
        title: '基本用法',
        controller: script,
        template: indexTemplate,
        script: rawScript
    }
};
