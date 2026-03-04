export const weeklyRule = {
  contentSelector: '#content',
  excludeSelectors: [
    '#together',
  ],
  waitUntil: 'load',
  async preProcess(page, options) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // Give JS time to settle after 'load'
    await delay(1500 + Math.random() * 1000)

    if (options?.onDelayEnd) {
      await options.onDelayEnd(page)
    }

    // Replace top table content with <blockquote>
    await page.evaluate(() => {
      document.querySelectorAll('#content .el-splitbar + table.el-content.top').forEach((table) => {
        const tds = table.querySelectorAll('td')
        if (tds.length !== 1) return
        const blockquote = document.createElement('blockquote')
        blockquote.innerHTML = tds[0].innerHTML
        table.parentNode.replaceChild(blockquote, table)
      })
    })

    // Remove leading splitbar table if it's the first child of #content
    await page.evaluate(() => {
      const content = document.querySelector('#content')
      const first = content?.firstElementChild
      if (first?.tagName === 'TABLE' && first.classList.contains('el-splitbar')) {
        first.remove()
      }
    })

    // Replace layout tables used as section headings with proper <h2> elements
    await page.evaluate(() => {
      document.querySelectorAll('#content table').forEach((table) => {
        const tds = table.querySelectorAll('td')
        if (tds.length !== 1) return
        const ps = tds[0].querySelectorAll('p')
        if (ps.length !== 1) return

        const p = ps[0]
        const fontSizeStyle = p.style.fontSize
        if (!fontSizeStyle) return
        const fontSize = parseFloat(fontSizeStyle)
        if (fontSize < 1.4) return

        const text = p.textContent?.trim()
        if (!text) { table.remove(); return }
        const h2 = document.createElement('h2')
        h2.textContent = text
        table.parentNode.replaceChild(h2, table)
      })
    })

    // Replace classifieds subtable with <blockquote>: el-content td content in <strong>, then el-md td content
    await page.evaluate(() => {
      document.querySelectorAll('#content table.el-subtable.classifieds').forEach((table) => {
        const parts = []

        table.querySelectorAll('table.el-content').forEach((t) => {
          t.querySelectorAll('td').forEach((td) => {
            parts.push('<strong>' + td.innerText.trim() + '</strong>')
          })
        })
        table.querySelectorAll('table.el-md').forEach((t) => {
          t.querySelectorAll('td').forEach((td) => {
            parts.push(td.innerHTML)
          })
        })

        const blockquote = document.createElement('blockquote')
        blockquote.innerHTML = parts.join(' ')
        table.parentNode.replaceChild(blockquote, table)
      })
    })

    // Replace single-cell blue content tables with <blockquote>
    await page.evaluate(() => {
      document.querySelectorAll('#content table.el-content.blue').forEach((table) => {
        const tds = table.querySelectorAll('td')
        if (tds.length !== 1) return
        const blockquote = document.createElement('blockquote')
        blockquote.innerHTML = tds[0].innerHTML
        table.parentNode.replaceChild(blockquote, table)
      })
    })

    // Replace single-cell item tables that contain both .name and .desc with <li>
    // .name is wrapped in <strong><em>, followed by .desc content
    await page.evaluate(() => {
      document.querySelectorAll('#content table.el-item').forEach((table) => {
        const tds = table.querySelectorAll('td')
        if (tds.length !== 1) return
        const td = tds[0]
        const nameEl = td.querySelector('.name')
        const descEl = td.querySelector('.desc')
        if (!nameEl || !descEl) return

        const li = document.createElement('li')

        const strong = document.createElement('strong')
        const em = document.createElement('em')
        em.innerHTML = '--- ' + nameEl.innerHTML
        strong.appendChild(em)

        li.insertAdjacentHTML('afterbegin', descEl.innerHTML + ' ')
        li.appendChild(strong)

        const br = document.createElement('br')
        table.parentNode.insertBefore(br, table)
        table.parentNode.replaceChild(li, table)
      })
    })

    // Replace single-cell tables whose <td> children are all <p> elements,
    // each containing both <a> and <cite>, with a <ul>.
    // Each <p> becomes a <li> with its content; <cite> is wrapped in <strong><em>.
    await page.evaluate(() => {
      document.querySelectorAll('#content table.el-md').forEach((table) => {
        const tds = table.querySelectorAll('td')
        if (tds.length !== 1) return
        const td = tds[0]

        const children = [...td.children]
        if (!children.length || !children.every((el) => el.tagName === 'P')) return
        if (!children.every((p) => p.querySelector('a') && p.querySelector('cite'))) return

        const ul = document.createElement('ul')

        children.forEach((p) => {
          p.querySelectorAll('cite').forEach((cite) => {
            const strong = document.createElement('strong')
            const em = document.createElement('em')
            em.innerHTML = '--- ' + cite.innerHTML
            strong.appendChild(em)
            cite.replaceWith(strong)
          })
          const li = document.createElement('li')
          li.innerHTML = p.innerHTML
          ul.appendChild(li)
        })

        const br = document.createElement('br')
        table.parentNode.insertBefore(br, table)
        table.parentNode.replaceChild(ul, table)
      })
    })
  },
}

/** @type {import('./index.js').SiteRule} */
export default {
  ...weeklyRule,
  async preProcess(page) {
    await weeklyRule.preProcess(page, {
      onDelayEnd: async (page) => {
        // Remove the JavaScript Weekly banner from the masthead
        await page.evaluate(() => {
          const table = document.querySelector('table.el-masthead')
          if (!table) return
          const td = table.querySelector('td')
          if (!td) return
          if (td.innerText.trim() === 'JavaScript Weekly') {
            table.parentNode.removeChild(table)
          }
        })
      }
    })
  }
}
