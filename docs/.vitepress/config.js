import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Chronos Seal',
  description: '时序为封印 · 行为作密钥 · 岁月守护原创',
  base: '/',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['script', { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-KVE03FKWDV' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-KVE03FKWDV');
    `]
  ],

  // 多语言配置 (预留英文)
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Chronos Seal',
      description: '时序为封印 · 行为作密钥 · 岁月守护原创'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Chronos Seal',
      description: 'Time as the seal, action as the key, time itself guards originality.',
      link: '/en/'
    }
  },

  themeConfig: {
    siteTitle: 'Chronos Seal',
    
    // 顶部导航栏：增加首页/指南链接
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'Basic 版', link: '/basic/preparation' },
      { text: 'GUI 版', link: '/gui/preparation' },
      { text: 'Pro 版', link: '/pro/preparation' },
      { 
        text: '相关链接', 
        items: [
          { text: '主仓库', link: 'https://github.com/CLARE-XHL/Chronos-Seal' },
          { text: '模板仓库', link: 'https://github.com/CLARE-XHL/Chronos-Builder-Template' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/CLARE-XHL/Chronos-Seal' }
    ],

    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/CLARE-XHL/Chronos-Seal/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    footer: {
      message: 'MIT License',
      copyright: `Copyright © ${new Date().getFullYear()} CLARE-XHL · CrCLARE 工作室`
    },

    // ==========================================
    // 侧边栏配置：按你的要求精准调整
    // ==========================================
    sidebar: {
      // 【全局指南】—— 首页链接，用于版本对比与选择
      '/guide/': [
        {
          text: '版本选择',
          items: [
            { text: '快速开始 (对比与缺陷)', link: '/guide/getting-started' }
          ]
        }
      ],

      // 【Basic 版】—— 删除了前言，快速开始改为准备工作
      '/basic/': [
        {
          text: '指南',
          items: [
            { text: '准备工作', link: '/basic/preparation' },
            { text: '网络环境', link: '/basic/network' }
          ]
        },
        {
          text: '使用教程',
          items: [
            { text: '使用 JS 插件与布入事件', link: '/basic/using-plugin' },
            { text: 'Fork 仓库与 Action 工作流', link: '/basic/fork-and-action' },
            { text: '使用 BAT 加密资源', link: '/basic/encrypt-assets' },
            { text: '构建工作', link: '/basic/build-work' },
            { text: '增量补丁 (CSDP)', link: '/basic/csdp-patch' }
          ]
        },
        {
          text: '参考与帮助',
          items: [
            { text: '错误码', link: '/basic/error-codes' },
            { text: '常见问题', link: '/basic/faq' },
            { text: '如何反馈', link: '/basic/feedback' },
            { text: '更新日志', link: '/basic/changelog' },
            { text: '贡献者名单', link: '/basic/contributors' },
            { text: '赞助者名单', link: '/basic/sponsors' }
          ]
        }
      ],

      // 【GUI 版】—— 只有准备工作
      '/gui/': [
        {
          text: 'GUI 版',
          items: [
            { text: '准备工作', link: '/gui/preparation' }
          ]
        }
      ],

      // 【Pro 版】—— 只有准备工作
      '/pro/': [
        {
          text: 'Pro 版',
          items: [
            { text: '准备工作', link: '/pro/preparation' }
          ]
        }
      ]
    }
  }
})
