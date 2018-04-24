
const ReportSync  = async (site) =>  {
   
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(site);
  
      if(site.indexOf('dropbox') >= 0) {
          const frames = await page.frames();
          const frame = frames.filter(f => {
              if (f.name() === 'preview-content') {
                  return f
              }
          })
          await page.goto(frame[0]._url);
      };
      
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
  
      return entities.decode(bodyHTML);
    
}

module.exports = { ReportSync };