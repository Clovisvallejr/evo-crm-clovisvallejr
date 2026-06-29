const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

async function scrape() {
  console.log('Iniciando scraper com modo stealth...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('Acessando https://imperiodosplasticos.com.br/ ...');
  try {
    await page.goto('https://imperiodosplasticos.com.br/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Extraindo links do site...');
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors.map(a => a.href).filter(href => href.includes('/produto/'));
    });
    
    // Remove duplicates
    const uniqueLinks = [...new Set(links)].slice(0, 5); // Let's just grab 5 for the mockup
    console.log(`Encontrados ${uniqueLinks.length} produtos para extrair.`);
    
    const products = [];
    for (const link of uniqueLinks) {
      console.log(`Extraindo: ${link}`);
      await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const product = await page.evaluate(() => {
        const titleEl = document.querySelector('h1.product_title, h1');
        const priceEl = document.querySelector('.price .amount, .woocommerce-Price-amount');
        const descEl = document.querySelector('.woocommerce-product-details__short-description, #tab-description');
        const imgEl = document.querySelector('.woocommerce-product-gallery__image img, img.wp-post-image');
        
        return {
          name: titleEl ? titleEl.innerText.trim() : 'Sem Nome',
          price: priceEl ? priceEl.innerText.trim() : '',
          description: descEl ? descEl.innerText.trim() : '',
          image_url: imgEl ? imgEl.src : ''
        };
      });
      product.url = link;
      products.push(product);
      console.log('Produto extraído:', product.name);
    }
    
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log('Salvo em products.json!');
    
  } catch (err) {
    console.error('Erro ao acessar a página:', err);
  } finally {
    await browser.close();
  }
}

scrape().catch(console.error);
