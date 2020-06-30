const puppeteer = require('puppeteer');

class instaData{
  constructor(instaInitData){
    this.targetUrl = '';
    this.username = '';
    this.password = '';
    this.loadMore = false;
    this.page = null;
    this.browser = null;
    this.countPostComments = 0;
    this.rawComments = [];
  };

  async goTargetUrl(){
    console.log(`Inicitalizing URL ${this.targetUrl}`)
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.goto('https://instagram.com');
    await this.page.waitForSelector('input[name="username"]');
    await this.page.type('input[name="username"]', this.username);
    await this.page.type('input[name="password"]', this.password);
    await this.page.click('button[type="submit"]');
    await this.page.goto(this.targetUrl)
    
    //Wait to show required selectors
    await this.page.waitForSelector('img[alt="Instagram"]')
    await this.page.waitForSelector('ul[class="Mr508"]')
    await this.page.waitForSelector('div[class=C4VMK]');
  };
  
  async loadMoreSelector(){
    console.log(`Checking 'Load More' button selector ...`)
    await this.page.waitForSelector('#react-root > section > main > div > div.ltEKP > article > div.eo2As > div.EtaWk > ul > li > div > button > span', {visible: true, timeout: 1000})
    .then(() => this.loadMore = true)
    .catch(() => this.loadMore = false)
    let count = 0;
    while(this.loadMore){
      console.log(`Loading more comments, page ${count}`)
      await this.page.click('#react-root > section > main > div > div.ltEKP > article > div.eo2As > div.EtaWk > ul > li > div > button > span', {visible: true, timeout: 2000}); 
      await this.page.waitForSelector('#react-root > section > main > div > div.ltEKP > article > div.eo2As > div.EtaWk > ul > li > div > button > span', {visible: true, timeout: 1000})
      .then(() => this.loadMore = true)
      .catch(() => this.loadMore = false)
      count++;
    }
  }

  async countComments(){
    let totalComments = await this.page.$$('#react-root > section > main > div > div.ltEKP > article > div.eo2As > div.EtaWk > ul > ul');
    this.countPostComments = totalComments.length;
  }  

  async getComments(){
    console.log(`Formatting Comments, please wait ...`)
    const coments = await this.page.evaluate(() => {
      const allComments = Array.from(document.querySelectorAll(`#react-root > section > main > div > div.ltEKP > article > div.eo2As > div.EtaWk > ul > ul`))
      let data = []

      for (var i = 0; i < allComments.length; i++) {
        let textComment = allComments[i].querySelector('div > li > div > div.C7I1f > div.C4VMK > span').textContent;
        let userComment = allComments[i].querySelector('div > li > div > div.C7I1f > div.C4VMK > h3 > div > a').textContent;
        let userAvatar = allComments[i].querySelector('div > li > div > div.C7I1f > div.RR-M-.TKzGu > a > img').getAttribute('src');

        data.push({
          textComment: textComment,
          userComment: userComment,
          userAvatar: userAvatar
        })
      }
      return data
    })  
    this.rawComments = coments
  } 

  async showResults(){
    await this.goTargetUrl()
    await this.loadMoreSelector()
    await this.countComments()
    await this.getComments()

    console.log(`Raw comments : `)
    console.log(this.rawComments)

    await this.browser.close();
    console.log(`Numbre of total comments : ${this.countPostComments}`)
    console.log(`Task Finished!`)
  }
};

const insta = new instaData()
insta.showResults()