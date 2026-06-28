/// <reference types="node" />

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('PWA shell', () => {
  it('does not use translucent iOS standalone chrome', () => {
    const html = readFileSync('index.html', 'utf8')

    expect(html).toContain('viewport-fit=cover')
    expect(html).toContain(
      '<meta name="apple-mobile-web-app-status-bar-style" content="black" />',
    )
    expect(html).not.toContain('black-translucent')
  })

  it('paints the bottom navigation through the iOS safe area', () => {
    const css = readFileSync('src/index.css', 'utf8')
    const tabCss = readFileSync('src/ui/TabBar.module.css', 'utf8')

    expect(css).toContain('--tab-bar-height: 68px;')
    expect(css).toContain(
      '--tab-bar-shell-height: calc(var(--tab-bar-height) + var(--safe-bottom));',
    )
    expect(tabCss).toContain('position: fixed;')
    expect(tabCss).toContain('bottom: 0;')
    expect(tabCss).toContain('height: var(--tab-bar-shell-height);')
  })
})
