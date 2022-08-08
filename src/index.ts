import * as webpack from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import * as cssjs from 'jotform-css.js';

export class WebpackPrebuildPlugin {
  private pluginName: string = 'WebpackPrebuildPlugin'
  private options: PluginOptions = {compilation_date: true, fonts: true, configs: true, images: true, sounds: true, variables: []};

  constructor(options: Object | null) {
    if (options != null) {
      if (options.hasOwnProperty('compilation_date')) this.options.compilation_date = options['compilation_date'];
      if (options.hasOwnProperty('fonts')) this.options.fonts = options['fonts'];
      if (options.hasOwnProperty('configs')) this.options.variables = options['configs'];
      if (options.hasOwnProperty('images')) this.options.images = options['images'];
      if (options.hasOwnProperty('sounds')) this.options.sounds = options['sounds'];
      if (options.hasOwnProperty('variables')) this.options.variables = options['variables'];
    }
  }

  private process = () => {
    if (this.options.compilation_date == true) this.process_date();
    if (this.options.fonts == true) this.process_fonts();
    if (this.options.configs == true) this.process_configs();
    if (this.options.images == true) this.process_images();
    if (this.options.sounds == true) this.process_sounds();
    this.process_variables();
  }

  private process_date = () => {
    let target: string = './src/utils/CompilationParams.ts';
    let date: Date = new Date();
    let year: number = date.getFullYear();
    let month: number = date.getMonth() + 1;
    let day: number = date.getUTCDate();
    let hours: number = date.getUTCHours();
    let minutes: number = date.getMinutes();
    let seconds: number = date.getSeconds();

    var res = this.create_time_part(day) + '.' + this.create_time_part(month) + '.' + this.create_time_part(year) + ' ' + this.create_time_part(hours) + ':' + this.create_time_part(minutes) + ':' + this.create_time_part(seconds) + ' UTC';
    res = 'export class CompilationParams { public static COMPILATION_DATE: string = "' + res + '"; }';
    fs.writeFileSync(target, res);
    console.log('-> build date created...');
  }

  private create_time_part = (value: number): string => {
    if (value == 0) return '00';
    else if (value < 10) return '0' + value.toString();
    return value.toString();
  }

  private process_fonts = () => {
    let src: string = './fonts/fonts.css';
    var target: string = './src/utils/FontsParams.ts';
    var css_text: string = fs.readFileSync(src, {encoding: 'utf8', flag: 'r'});

    var parser = new cssjs.cssjs();
    var parsed = parser.parseCSS(css_text);

    var fonts_res: Array<string> = [];

    for (var i = 0; i < parsed.length; i++) {
      var rules = parsed[i].rules;
      for (var j = 0; j < rules.length; j++) {
        if (rules[j].directive == 'font-family') {
          var value: string = rules[j].value.split('\'').join('');
          fonts_res.push(value);
        }
      }
    }

    var res = 'export class FontsParams { public static FONTS: Array<string> = ' + JSON.stringify(fonts_res) + '; }';
    fs.writeFileSync(target, res);
    console.log('-> fonts parsed...');
  }

  private process_configs = () => {
    let configs_folder: string = './configs/';
    let target: string = './src/utils/Data.ts';
    let tmp: string = configs_folder.split('/').join('\\').substring(2);
    var res: string = '';

    var list: Array<string> = fileList(configs_folder);

    for (var i: number = 0; i < list.length; i++) {
      var file_path: string = list[i].split(tmp)[1];
      let index: number = file_path.lastIndexOf('\\');
      let file_name: string = file_path.substring(index + 1);
      index = file_name.lastIndexOf('.');
      file_name = file_name.substring(0, index);
      file_path = file_path.split('\\').join('/');
      let file_data: string = fs.readFileSync(configs_folder + file_path, 'utf8');
      file_data = JSON.parse(file_data);
      file_data = JSON.stringify(file_data);
      let file: string = '\tpublic static ' + file_name + ': string = \'' + Buffer.from(file_data).toString('base64') + '\';\n';
      res = res + file;
    }
    res = 'export class Data\n{\n' + res + '\n}';
    fs.writeFileSync(target, res);

    console.log('-> configs parsed...');
  }

  private process_images = () => {
    let images_folder: string = './data/images/';
    let target: string = './configs/images.json';

    let tmp: string = images_folder.split('/').join('\\').substring(2);
    let res: Object = {};
    let list: Array<string> = fileList(images_folder);

    for (var i: number = 0; i < list.length; i++) {
      var file_path: string = list[i].split(tmp)[1];
      let index: number = file_path.lastIndexOf('\\');
      let file_name: string = file_path.substring(index + 1);
      index = file_name.lastIndexOf('.');
      file_name = file_name.substring(0, index);
      res[file_name] = file_path.split('\\').join('/');
    }

    fs.writeFileSync(target, JSON.stringify(res));
    console.log('-> images parsed...');
  }

  private process_sounds = () => {
    let sounds_folder: string = './data/sounds/';
    let target: string = './configs/sounds.json';

    var tmp: string = sounds_folder.split('/').join('\\').substring(2);
    var res: Object = {};

    if (fs.existsSync(sounds_folder)) {
      var list: Array<string> = fileList(sounds_folder);

      for (var i: number = 0; i < list.length; i++) {
        let file_path: string = list[i].split(tmp)[1];
        let index: number = file_path.lastIndexOf('\\');
        let file_name: string = file_path.substring(index + 1);
        index = file_name.lastIndexOf('.');
        file_name = file_name.substring(0, index);
        res[file_name] = file_path.split('\\').join('/');
      }
    }

    fs.writeFileSync(target, JSON.stringify(res));
    console.log('-> sounds parsed...');
  }

  private process_variables = () => {
    let variables: string = 'var showhelp_var = "%task%_showhelp";\nvar completed_var = "%task%_completed";\nvar store_var = "%task%_store";';

    if (this.options.variables != null && this.options.variables.length > 0) {
      for (let i: number = 0; i < this.options.variables.length; i++) {

        let variable: string = this.options.variables[i];
        let part: string = variable.split('_')[0];
        variables = variables + '\nvar ' + variable + ' = "%task%_' + part + '"';
      }
    }

    let target: string = './src/variables.js';
    let parts: Array<string> = process.cwd().split('\\');
    let task: string = parts[parts.length - 1];
    let res: string = variables.split('%task%').join(task);

    fs.writeFileSync(target, res);

    console.log('-> variables created...');
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.run.tap(this.pluginName, (compilation: webpack.Compiler) => {

      console.log(this.pluginName, 'started!');
      this.process();
    });
  }
}

interface PluginOptions {
  compilation_date: boolean;
  fonts: boolean;
  configs: boolean;
  images: boolean;
  sounds: boolean;
  variables: Array<string>;
}

function fileList(dir: string): Array<string> {
  return fs.readdirSync(dir).reduce(function (list: Array<string>, file: string) {
    let name: string = path.join(dir, file);
    let isDir: boolean = fs.statSync(name).isDirectory();
    return list.concat(isDir ? fileList(name) : [name]);
  }, []);
}