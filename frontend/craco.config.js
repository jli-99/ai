// craco.config.js

module.exports = {
    // Override CRA webpack/babel configuration
    webpack: {
        configure: (webpackConfig) => {
            // Just return the default config for now
            return webpackConfig;
        },
    },
    
    // Optional: Add Babel plugins or presets
    babel: {
        plugins: [],
        presets: [],
    },

    // Optional: Add PostCSS or CSS overrides
    style: {
        postcss: {
            plugins: [],
        },
    },
};
