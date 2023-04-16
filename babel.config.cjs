
const env = process.env.BABEL_ENV || 'esm';

module.exports = {
    targets: {
        node: '14.15', // Support Node v14.15 (Fermium) LTS or higher
        browsers: [
            'defaults',
        ],
    },
    presets: [
        ['@babel/env', {
            // Whether to transpile modules
            modules: env === 'cjs' ? 'commonjs' : false,
            
            // Do not include polyfills automatically. Leave it up to the consumer to include the right polyfills
            // for their required environment.
            useBuiltIns: false,
            
            exclude: [
                // Do not transpile generators (saves us from needing a polyfill)
                'transform-regenerator',
            ],
        }],
        '@babel/typescript',
    ],
    plugins: [
        ['transform-builtin-extend', {
            // See: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work
            globals: ['Error', 'String', 'Number', 'Array', 'Promise'],
        }],
    ],
    sourceMaps: 'inline',
};
