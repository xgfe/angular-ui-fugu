import app from 'app';
import angular from 'angular';
import docs from 'examples/ui-xg/docs';

function splitReadme(readme) {
    let idx = readme.indexOf('<h2 id="arguments"');
    return {
        doc: readme.slice(0, idx),
        attrs: readme.slice(idx)
            .replace(/<table/g, '<table class="table table-bordered table-striped"')
    };
}

const ROUTES = [];
docs.forEach((component) => {
    let readme = splitReadme(component.readme);
    let content = [
        `<div ng-non-bindable>${readme.doc}</div>`,
        '<h2>示例代码</h2>'
    ];
    let demos = [];
    for (let name in component.demos) {
        let demo = component.demos[name];
        let controllerName = component.name + '_' + name;
        app.controller(controllerName, demo.controller);
        demos.push({
            id: controllerName,
            title: demo.title
        });
        content = content.concat([
            `<a class="demo-anchor" id="${controllerName}"></a>`,
            '<h3>' + demo.title + '</h3>',
            demo.description ? '<p>' + demo.description + '</p>' : '',
            '<div class="demo-box">',
            `<div ng-controller="${controllerName} as vm">${demo.template}</div>`,
            '</div>',
            `<code-box template="${encodeURIComponent(demo.template)}" script="${encodeURIComponent(demo.script)}"></code-box>`
        ]);
    }
    content.push(`<div ng-non-bindable>${readme.attrs}</div>`);
    // eslint-disable-next-line no-undef
    if (!PUBLISH_TO_GITHUB) {
        content.push(`<demo-affix demos="${encodeURIComponent(angular.toJson(demos))}"></demo-affix>`);
    }
    ROUTES.push({
        name: component.name,
        template: content.join('')
    });
});
export { ROUTES };
