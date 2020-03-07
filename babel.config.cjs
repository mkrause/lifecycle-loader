
const env = process.env.BABEL_ENV || 'esm';

module.exports = {
    presets: [
        '@babel/typescript',
        ['@babel/env', {
            targets: {
                browsers: [
                    'node 8.9', // Support Node v8.9 LTS (Carbon)
                    '>0.1%',
                    'not dead',
                    'not OperaMini all',
                    'not IE < 11',
                    'last 2 Edge versions',
                ],
            },
            
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
    ],
    plugins: [
        '@babel/proposal-class-properties',
        '@babel/plugin-syntax-bigint',
        
        ['transform-builtin-extend', {
            // See: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work
            globals: ['Error', 'String', 'Number', 'Array', 'Promise'],
        }],
    ],
};
