
const env = process.env.BABEL_ENV || 'esm';

module.exports = {
    presets: [
        '@babel/typescript',
        ['@babel/env', {
            targets: {
                browsers: [
                    'node 10.13', // Support Node v10.13 LTS (Dubnium) or higher
                    'last 2 Chrome versions',
                    'last 2 Firefox versions',
                    'last 2 Safari versions',
                    'last 2 Edge versions',
                    '>0.1%',
                    'not dead',
                    'not OperaMini all',
                    'not IE < 11',
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
        
        ['transform-builtin-extend', {
            // See: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work
            globals: ['Error', 'String', 'Number', 'Array', 'Promise'],
        }],
    ],
    sourceMaps: 'inline',
};
