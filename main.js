const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)
const isMain = str => (/^#{1,2}[^#].*/).test(str)
const isSub = str => (/^#{3}[^#].*/).test(str)
const convert = raw => {
  //将raw按#分隔成数组，先去掉空字符串数组，再去掉余下数组开头的空格
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(str => str !== "").map(str => str.trim())
  let html = ''
  for (let i = 0; i < arr.length; i++) {
    if (i < arr.length - 1) {
      if(isMain(arr[i]) && isMain(arr[i+1])){
        html += `
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
`
      }else if(isMain(arr[i]) && isSub(arr[i+1])){
        html += `
          <section>
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
`
      }else if(isSub(arr[i]) && isMain(arr[i+1])){
        html += `
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
          </section>
`
      }else if(isSub(arr[i]) && isSub(arr[i+1])){
        html += `
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
`
      }
    } else {
      if (isMain(arr[i])) {
        html += `
          <section data-markdown>
            <textarea data-template>${arr[i]}</textarea>
          </section>
          `
      } else if (isSub(arr[i])) {
        html += `
          <section data-markdown>
            <textarea data-template>${arr[i]}</textarea>
          </section>
        </section>
`
      }
    }
  }
  return html
}
const PTL = `# 欢迎来到 OneSlide
#### 你可以通过↑ ↓ ← →切换页面

## 这是一款将 markdown 转换成 PPT 的工具
### 如果你还不清楚markdown语法，可以点击设置→帮助 查看文档学习

## 鼠标放在左上角可以打开设置选项

## 感谢您的使用`

const Menu = {
  init(){
    console.log('Menu init...')
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')
    this.bind()
  },

  bind(){
    this.$settingIcon.onclick = () =>{
      this.$menu.classList.add('open')
    }

    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove('open')
    }

    this.$$tabs.forEach($tab => $tab.onclick = () => {
      this.$$tabs.forEach($node => $node.classList.remove('active'))
      $tab.classList.add('active')
      let index = Array.from(this.$$tabs).indexOf($tab)
      this.$$contents.forEach($node => $node.classList.remove('active'))
      this.$$contents[index].classList.add('active')
    })
  }
}

const ImgUploader = {
  init() {
    this.$fileInput = $('#img-uploader')
    this.$textarea = $('.editor textarea')

    AV.init({
      appId: "V1zu6WKNfGMmX2npJ2vlfzN2-gzGzoHsz",
      appKey: "vAxkhzIfCtPgQvH41rvwetQg",
      serverURLs: "https://v1zu6wkn.lc-cn-n1-shared.com"
    })

    this.bind()
  },

  bind() {
    let self = this
    this.$fileInput.onchange = function() {
      if (this.files.length > 0) {
        let localFile = this.files[0]
        console.log(localFile)
        if(localFile.size/1048576 > 2) {
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]()`)
        let  avFile = new AV.File(encodeURI(localFile.name), localFile)
        avFile.save({
          keepFileName: true,
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          console.log('文件保存完成')
          console.log(file)
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
          self.insertText(text)
        }).catch(err => console.log(err))
      }
    }
  },

  insertText(text = '') {
    let $textarea = this.$textarea
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
}

const Editor = {
  init(){
    console.log('Editor init...')
    this.$editorInput = $('.editor textarea')
    this.$saveBtn = $('.editor .button-save')
    this.markdown = localStorage.markdown || PTL
    this.$slideContainer = $('.slides')
    this.bind()
    this.start()
  },

  bind(){
    this.$saveBtn.onclick = () => {
      localStorage.markdown = this.$editorInput.value
      location.reload()
    }
  },

  start(){
    this.$editorInput.value = this.markdown
    this.$slideContainer.innerHTML = convert(this.markdown)
    Reveal.initialize({
      controls: true,
      progress: true,
      center: localStorage.align !== "left-top",
      hash: true,
      transition: localStorage.transition || 'none',
      plugins: [ RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight ]
    })
  }
}

const App ={
  init(){
    Array.from(arguments).forEach(Module => Module.init())
  }
}

const Theme = {
  init(){
    this.$$figures = $$('.theme figure')
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')
    this.$reveal = $('.reveal')
    this.bind()
    this.loadTheme()
  },

  bind() {
    this.$$figures.forEach($figure => $figure.onclick = () => {
      this.$$figures.forEach(item => item.classList.remove('select'))
      $figure.classList.add('select')
      this.setTheme($figure.dataset.theme)
    })

    this.$transition.onchange = function() {
      localStorage.transition = this.value
      location.reload()
    }

    this.$align.onchange = function() {
      localStorage.align = this.value
      location.reload()
    }
  },

  setTheme(theme) {
    localStorage.theme = theme
    location.reload()
  },

  loadTheme() {
    let theme = localStorage.theme || 'beige'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `dist/theme/${theme}.css`
    document.head.appendChild($link)
    Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
    this.$transition.value = localStorage.transition || 'none'
    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init(){
    this.$downloadBtn = $('.downloadBtn')
    this.bind()
  },

  bind(){
    this.$downloadBtn.onclick = () => {
      let $link = document.createElement('a')
      $link.target = '_blank'
      $link.href = location.href.replace(/#\/.*/,'?print-pdf') + '?print-pdf'
      $link.click()
    }
  }
}

App.init(Menu,ImgUploader,Editor,Theme,Print,)





