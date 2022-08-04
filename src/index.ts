import {Compiler} from 'webpack';

const pluginName = 'WebpackPrebuildPlugin';

export class WebpackPrebuildPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.run.tap(pluginName, (compilation: Compiler) => {
      console.log(typeof compilation);
      console.log('The webpack build process is starting!');
    });
  }
}