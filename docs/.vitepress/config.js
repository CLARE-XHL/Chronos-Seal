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

  // ==========================================
  // 多语言配置 (i18n) - 预留英文
  // ==========================================
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
    
    // 顶部导航栏
    nav: [
      { text: 'Basic 版', link: '/basic/getting-started' },
      { text: 'GUI 版', link: '/gui/getting-started' },
      { text: 'Pro 版', link: '/pro/getting-started' },
      { 
        text: '相关链接', 
        items: [
          { text: '主仓库', link: 'https://github.com/CLARE-XHL/Chronos-Seal' },
          { text: '模板仓库', link: 'https://github.com/CLARE-XHL/Chronos-Builder-Template' }
        ]
      }
    ],

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CLARE-XHL/Chronos-Seal' }
    ],

    // 页脚与编辑链接
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
    // 侧边栏配置
    // ==========================================
    sidebar: {
      // 【Basic 版】—— 核心工作区
      '/basic/': [
        {
          text: '指南',
          items: [
            { text: '前言', link: '/basic/introduction' },
            { text: '快速开始', link: '/basic/getting-started' },
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

      // 【GUI 版】—— 快速开始占位
      '/gui/': [
        {
          text: 'GUI 版',
          items: [
            { text: '快速开始', link: '/gui/getting-started' }
          ]
        }
      ],

      // 【Pro 版】—— 快速开始占位
      '/pro/': [
        {
          text: 'Pro 版',
          items: [
            { text: '快速开始', link: '/pro/getting-started' }
          ]
        }
      ]
    }
  }
})
