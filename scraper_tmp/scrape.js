const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrape() {
  console.log('Iniciando o scraper...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navegando para a página inicial...');
  await page.goto('https://imperiodosplasticos.com.br/', { waitUntil: 'networkidle2' });
  
  const html = await page.content();
  fs.writeFileSync('page_source.html', html);
  
  console.log('Código fonte salvo em page_source.html');
  await browser.close();
}

scrape().catch(console.error);
