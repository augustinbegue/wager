import puppeteer from 'puppeteer';

export async function closeBanners(page: puppeteer.Page) {
    await page.evaluate(() => {
        let cookies = document.querySelector("#onetrust-close-btn-container > button") as HTMLButtonElement;
        if (cookies) {
            cookies.click();
        }
    });
}
