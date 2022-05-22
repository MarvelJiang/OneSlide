const isMain = (str)=>/^#{1,2}[^#].*/.test(str)
;
const isSub = (str)=>/^#{3}[^#].*/.test(str)
;
function convert(raw1) {
    //将raw按#分隔成数组，先去掉空字符串数组，再去掉余下数组开头的空格
    let arr = raw1.split(/\n(?=\s*#)/).filter((str)=>str !== ""
    ).map((str)=>str.trim()
    );
    let html = '';
    for(let i = 0; i < arr.length; i++)if (i < arr.length - 1) {
        if (isMain(arr[i]) && isMain(arr[i + 1])) html += `
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
`;
        else if (isMain(arr[i]) && isSub(arr[i + 1])) html += `
          <section>
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
`;
        else if (isSub(arr[i]) && isMain(arr[i + 1])) html += `
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
          </section>
`;
        else if (isSub(arr[i]) && isSub(arr[i + 1])) html += `
            <section data-markdown>
              <textarea data-template>${arr[i]}</textarea>
            </section>
`;
    } else {
        if (isMain(arr[i])) html += `
          <section data-markdown>
            <textarea data-template>${arr[i]}</textarea>
          </section>
          `;
        else if (isSub(arr[i])) html += `
          <section data-markdown>
            <textarea data-template>${arr[i]}</textarea>
          </section>
        </section>
`;
    }
    console.log(html);
}
let raw = `
# 欢迎来到OneSlide

##这是第一页

##这是第二页

##这是第三页
###这是子页面1
###这是子页面2

##这是第四页
`;

//# sourceMappingURL=demo.c4775257.js.map
