# validate-commit-msg

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencyci-badge]][dependencyci]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npm-stat]
[![MIT License][license-badge]][LICENSE]

[![PRs Welcome][prs-badge]][prs]
[![Donate][donate-badge]][donate]
[![Code of Conduct][coc-badge]][coc]
[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

This provides you a binary that you can use as a githook to validate the commit message. I recommend
[husky](http://npm.im/husky). You'll want to make this part of the `commit-msg` githook.

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
      "subjectPatternErrorMsg": 'subject does not match subject pattern!', // default
      "helpMessage": "" //default
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

The `helpMessage` also supports interpoling a single `%s` with the original commit message.

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
