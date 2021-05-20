module.exports = {
  ignores: [(commit) => commit.includes('init')], //提交过程中忽略有init的字符串
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    //提交解析规则
    parserOpts: {
      headerPattern: /^【(\w*|[\u4e00-\u9fa5]*)】(.*)/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'body-leading-blank': [2, 'always'], //body上面要有换行
    'footer-leading-blank': [1, 'always'], //footer上面要有换行
    'header-max-length': [2, 'always', 108], //header最大108个字符
    'subject-empty': [2, 'never'], //subject位不能为null
    'type-empty': [2, 'never'], //type位不能为null
    'type-enum': [
      //type提交规则
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'style',
        'docs',
        'test',
        'refactor',
        'chore',
        'revert',
        'wip',
        'types',
      ],
    ],
  },
};
