const { createMacro } = require('babel-plugin-macros');
const globby = require('globby');
const path = require('path');

const requireStories = createMacro(({ references, state, babel }) => {
    const { types: t } = babel;

    references.default.forEach((refPath) => {
        const { node: currentNode, parent: parentNode } = refPath;
        const macroName = t.isIdentifier(currentNode) ? currentNode.name : 'requireStories';
        if (!t.isCallExpression(parentNode)) {
            throw new Error(`${macroName} can only be used as a call expression`);
        }

        /** @type {string[]} */
        const globPatterns = [];
        /** @param {{type: string} | null} node */
        const collectGlobFromStringLiteral = (node) => {
            if (!t.isStringLiteral(node)) {
                const nodeType = node === null ? 'null' : `type "${node.type}"`;
                throw new Error(`${macroName} called with invalid AST node of ${nodeType}`);
            }
            globPatterns.push(node.value);
        };

        if (parentNode.arguments.length !== 1) {
            throw new Error(`${macroName} only takes 1 argument`);
        }
        const {
            arguments: [callArgument],
        } = parentNode;
        if (t.isArrayExpression(callArgument)) {
            callArgument.elements.forEach(collectGlobFromStringLiteral);
        } else {
            collectGlobFromStringLiteral(callArgument);
        }

        globPatterns.forEach((pattern) => {
            if (!pattern.includes('stories.')) {
                throw new Error(`${macroName} called with an invalid pattern "${pattern}"`);
            }
        });

        const files = globby.sync(globPatterns, {
            absolute: true,
            cwd: path.dirname(state.filename),
        });

        const replacementNodes = files.map((file) =>
            t.callExpression(t.identifier('require'), [t.stringLiteral(file)]),
        );
        refPath.parentPath.replaceWithMultiple(replacementNodes);
    });
});

module.exports = requireStories;
