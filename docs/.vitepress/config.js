export default {
  title: 'Chronos Seal',
  description: '时序为封印 · 行为作密钥 · 岁月守护原创',
  base: '/',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }]
  ],
  themeConfig: {
    siteTitle: 'Chronos Seal',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '模板仓库', link: 'https://github.com/CLARE-XHL/Chronos-Builder-Template' },
      { text: 'GitHub', link: 'https://github.com/CLARE-XHL/Chronos-Seal' }
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '检查点植入', link: '/guide/scan-and-insert' },
        { text: '云端编译', link: '/guide/cloud-build' },
        { text: '部署到游戏', link: '/guide/deploy' }
      ],
      '/reference/': [
        { text: '错误码', link: '/reference/error-codes' },
        { text: '更新日志', link: '/reference/changelog' }
      ],
      '/builder/': [
        { text: '模板仓库使用说明', link: '/builder/template-usage' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CLARE-XHL/Chronos-Seal' }
    ],
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2026 CLARE-XHL'
    },
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/CLARE-XHL/Chronos-Seal/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
}
