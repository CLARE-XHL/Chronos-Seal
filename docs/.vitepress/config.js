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
      { text: '指南', link: '/guide/introduction' },
      { text: '主仓库', link: 'https://github.com/CLARE-XHL/Chronos-Seal' },
      { text: 'Action模板仓库', link: 'https://github.com/CLARE-XHL/Chronos-Builder-Template' }
    ],
    sidebar: {
      '/guide/': [
        { text: '前言', link: '/guide/introduction' },
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '使用 JS 插件与布入事件', link: '/guide/using-plugin' },
        { text: 'Fork 仓库与 Action 工作流', link: '/guide/fork-and-action' },
        { text: '使用BAT加密资源', link: '/guide/encrypt-assets' },
        { text: '构建工作', link: '/guide/build-work' },
        { text: '网络环境', link: '/guide/network' },
        { text: '错误码', link: '/reference/error-codes' },
        { text: '常见问题', link: '/guide/faq' },
        { text: '关于 Chronos Seal', link: '/guide/about' },
        { text: '如何反馈', link: '/guide/feedback' },
        { text: '更新日志', link: '/reference/changelog' },
        { text: '贡献者名单', link: '/guide/contributors' },
        { text: '赞助者名单', link: '/guide/sponsors' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CLARE-XHL/Chronos-Seal' }
    ],
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2026 CLARE-XHL • Nook Inc. 是任天堂的商标，本文档站点为独立开源项目，与任天堂不存在任何关联'
    },
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/CLARE-XHL/Chronos-Seal/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
}
