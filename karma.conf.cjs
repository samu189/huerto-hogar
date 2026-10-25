// Configuración de Karma para ejecutar las pruebas unitarias con Jasmine.
// Karma abre Chrome, carga los archivos *.spec.js empaquetados con webpack
// y muestra el resultado de cada prueba. También genera el informe de cobertura.
// Se usa la extensión .cjs porque package.json tiene "type": "module".

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],

    // Archivos de prueba: todo lo que esté en src/tests y termine en .spec.js
    files: [{ pattern: 'src/tests/**/*.spec.js', watched: false }],

    preprocessors: {
      'src/tests/**/*.spec.js': ['webpack']
    },

    // webpack + babel traducen JSX y JavaScript moderno para que Chrome lo entienda.
    // babel-plugin-istanbul instrumenta los componentes para medir la cobertura.
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            // Permite importar '../components/Navbar' sin escribir la extensión .jsx
            // (necesario porque package.json usa "type": "module")
            test: /\.(js|jsx)$/,
            resolve: { fullySpecified: false }
          },
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  ['@babel/preset-react', { runtime: 'automatic' }]
                ],
                plugins: [
                  ['istanbul', { include: ['src/**/*.js', 'src/**/*.jsx'], exclude: ['src/tests/**'] }]
                ]
              }
            }
          }
        ]
      },
      resolve: { extensions: ['.js', '.jsx'] }
    },

    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-jasmine-html-reporter',
      'karma-coverage'
    ],

    client: {
      jasmine: { random: false }, // las pruebas corren en orden (TEST 1 al 10)
      clearContext: false         // deja visible el resultado en la ventana de Chrome
    },

    // progress = resumen en la terminal, kjhtml = página con resultados en Chrome,
    // coverage = informe de cobertura en la carpeta coverage/
    reporters: ['progress', 'kjhtml', 'coverage'],

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text' }
      ]
    },

    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox'] }
    },

    singleRun: false,
    restartOnFileChange: true
  });
};
