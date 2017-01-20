# validate-commit-msg

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencyci-badge]][dependencyci]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npm-stat]
[![MIT License][license-badge]][LICENSE]

[![All Contributors](https://img.shields.io/badge/all_contributors-23-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Donate][donate-badge]][donate]
[![Code of Conduct][coc-badge]][coc]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

This provides you a binary that you can use as a githook to validate the commit message. I recommend
[husky](http://npm.im/husky). You'll want to make this part of the `commit-msg` githook, e.g. when using [husky](http://npm.im/husky), add `"commitmsg": "validate-commit-msg"` to your [npm scripts](https://docs.npmjs.com/misc/scripts) in `package.json`.

Validates that your commit message follows this format:

```
<type>(<scope>): <subject>
```

## Usage

### options

You can specify options in `package.json`

```javascript
{
  "config": {
    "validate-commit-msg": {
      "types": ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "revert"], // default
      "warnOnFail": false, // default
      "maxSubjectLength": 100, // default
      "subjectPattern": ".+", // default
      "subjectPatternErrorMsg": "subject does not match subject pattern!", // default
      "helpMessage": "", // default
      "autoFix": false // default
    }
  }
}
```

#### types

These are the types that are allowed for your commit message. If omitted, the value is what is shown above.

You can also specify: `"types": "*"` to indicate that you don't wish to validate types.

Or you can specify the name of a module that exports types according to the
[conventional-commit-types](https://github.com/adjohnson916/conventional-commit-types)
spec, e.g. `"types": "conventional-commit-types"`.

#### warnOnFail

If this is set to `true` errors will be logged to the console, however the commit will still pass.

#### maxSubjectLength

This will control the maximum length of the subject.

#### subjectPattern

Optional, accepts a RegExp to match the commit message subject against.

#### subjectPatternErrorMsg

If `subjectPattern` is provided, this message will be displayed if the commit message subject does not match the pattern.

#### helpMessage

If provided, the helpMessage string is displayed when a commit message is not valid. This allows projects to provide a better developer experience for new contributors.

The `helpMessage` also supports interpolating a single `%s` with the original commit message.

#### autoFix

If this is set to `true`, type will be auto fixed to all lowercase, subject first letter will be lowercased, and the commit will pass (assuming there's nothing else wrong with it).

### Other notes

If the commit message begins with `WIP` then none of the validation will happen.


## Credits

This was originally developed by contributors to [the angular.js project](https://github.com/angular/angular.js). I
pulled it out so I could re-use this same kind of thing in other projects.

[build-badge]: https://img.shields.io/travis/kentcdodds/validate-commit-msg.svg?style=flat-square
[build]: https://travis-ci.org/kentcdodds/validate-commit-msg
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/validate-commit-msg.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/validate-commit-msg
[dependencyci-badge]: https://dependencyci.com/github/kentcdodds/validate-commit-msg/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/kentcdodds/validate-commit-msg
[version-badge]: https://img.shields.io/npm/v/validate-commit-msg.svg?style=flat-square
[package]: https://www.npmjs.com/package/validate-commit-msg
[downloads-badge]: https://img.shields.io/npm/dm/validate-commit-msg.svg?style=flat-square
[npm-stat]: http://npm-stat.com/charts.html?package=validate-commit-msg&from=2016-04-01
[license-badge]: https://img.shields.io/npm/l/validate-commit-msg.svg?style=flat-square
[license]: https://github.com/kentcdodds/validate-commit-msg/blob/master/other/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[donate]: http://kcd.im/donate
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/validate-commit-msg/blob/master/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/kentcdodds/validate-commit-msg.svg?style=social
[github-watch]: https://github.com/kentcdodds/validate-commit-msg/watchers
[github-star-badge]: https://img.shields.io/github/stars/kentcdodds/validate-commit-msg.svg?style=social
[github-star]: https://github.com/kentcdodds/validate-commit-msg/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20validate-commit-msg!%20https://github.com/kentcdodds/validate-commit-msg%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/kentcdodds/validate-commit-msg.svg?style=social

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub>Kent C. Dodds</sub>](https://kentcdodds.com)<br />💁 [💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=kentcdodds) [📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=kentcdodds) 👀 [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=kentcdodds) | [<img src="https://avatars.githubusercontent.com/u/13700?v=3" width="100px;"/><br /><sub>Remy Sharp</sub>](http://remysharp.com)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=remy) [📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=remy) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=remy) | [<img src="https://avatars.githubusercontent.com/u/1692136?v=3" width="100px;"/><br /><sub>Cédric Malard</sub>](http://valdun.net)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=cmalard) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=cmalard) | [<img src="https://avatars.githubusercontent.com/u/696693?v=3" width="100px;"/><br /><sub>Mark Dalgleish</sub>](markdalgleish.com)<br />[📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=markdalgleish) | [<img src="https://avatars.githubusercontent.com/u/1018189?v=3" width="100px;"/><br /><sub>Ryan Kimber</sub>](https://formhero.io)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=ryan-kimber) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=ryan-kimber) | [<img src="https://avatars.githubusercontent.com/u/43780?v=3" width="100px;"/><br /><sub>Javier Collado</sub>](https://github.com/jcollado)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=jcollado) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=jcollado) | [<img src="https://avatars.githubusercontent.com/u/606014?v=3" width="100px;"/><br /><sub>Jamis Charles</sub>](https://github.com/jamischarles)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=jamischarles) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=jamischarles) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars.githubusercontent.com/u/2112202?v=3" width="100px;"/><br /><sub>Shawn Erquhart</sub>](http://www.professant.com)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=erquhart) [📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=erquhart) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=erquhart) | [<img src="https://avatars.githubusercontent.com/u/194482?v=3" width="100px;"/><br /><sub>Tushar Mathur</sub>](http://tusharm.com)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=tusharmath) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=tusharmath) | [<img src="https://avatars.githubusercontent.com/u/904007?v=3" width="100px;"/><br /><sub>Jason Dreyzehner</sub>](https://twitter.com/bitjson)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=bitjson) [📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=bitjson) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=bitjson) | [<img src="https://avatars.githubusercontent.com/u/9654923?v=3" width="100px;"/><br /><sub>Abimbola Idowu</sub>](http://twitter.com/hisabimbola)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=hisabimbola) | [<img src="https://avatars.githubusercontent.com/u/2212006?v=3" width="100px;"/><br /><sub>Gleb Bahmutov</sub>](https://glebbahmutov.com/)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=bahmutov) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=bahmutov) | [<img src="https://avatars.githubusercontent.com/u/332905?v=3" width="100px;"/><br /><sub>Dennis</sub>](http://dennis.io)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=ds82) | [<img src="https://avatars.githubusercontent.com/u/6425649?v=3" width="100px;"/><br /><sub>Matt Lewis</sub>](https://mattlewis.me/)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=mattlewis92) |
| [<img src="https://avatars.githubusercontent.com/u/323761?v=3" width="100px;"/><br /><sub>Tom Vincent</sub>](https://tlvince.com)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=tlvince) | [<img src="https://avatars.githubusercontent.com/u/615381?v=3" width="100px;"/><br /><sub>Anders D. Johnson</sub>](https://andrz.me/)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=adjohnson916) [📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=adjohnson916) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=adjohnson916) | [<img src="https://avatars.githubusercontent.com/u/1643758?v=3" width="100px;"/><br /><sub>James Zetlen</sub>](jameszetlen.com)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=zetlen) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=zetlen) | [<img src="https://avatars.githubusercontent.com/u/235784?v=3" width="100px;"/><br /><sub>Paul Bienkowski</sub>](http://opatut.de)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=opatut) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=opatut) | [<img src="https://avatars.githubusercontent.com/u/324073?v=3" width="100px;"/><br /><sub>Barney Scott</sub>](https://github.com/bmds)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=bmds) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=bmds) | [<img src="https://avatars.githubusercontent.com/u/5572221?v=3" width="100px;"/><br /><sub>Emmanuel Murillo Sánchez</sub>](https://github.com/Emmurillo)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=Emmurillo) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=Emmurillo) | [<img src="https://avatars.githubusercontent.com/u/968267?v=3" width="100px;"/><br /><sub>Hans Kristian Flaatten</sub>](https://starefossen.github.io)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=Starefossen) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=Starefossen) |
| [<img src="https://avatars.githubusercontent.com/u/16605186?v=3" width="100px;"/><br /><sub>Bo Lingen</sub>](https://github.com/citycide)<br />[📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=citycide) | [<img src="https://avatars.githubusercontent.com/u/1057324?v=3" width="100px;"/><br /><sub>Spyros Ioakeimidis</sub>](http://www.spyros.io)<br />[💻](https://github.com/kentcdodds/validate-commit-msg/commits?author=spirosikmd) [📖](https://github.com/kentcdodds/validate-commit-msg/commits?author=spirosikmd) [⚠️](https://github.com/kentcdodds/validate-commit-msg/commits?author=spirosikmd) |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
