import {Command, flags} from '@oclif/command'

class PdsCli extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ pds-cli
hello world from ./src/pds-cli.ts!
`,
  ]

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    // add --help flag to show CLI version
    help: flags.help({char: 'h'}),

    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    var readline = require('readline');

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("Enter external DB URI: ", function(answer: any) {
      rl.question("Enter project name: ", function(answer: any) {
        rl.close();
      });
    });
  }
}

export = PdsCli
