import puppeteer from 'puppeteer';

export async function closeBanners(page: puppeteer.Page) {
    await page.evaluate(() => {
        let cookies = document.querySelector("#onetrust-close-btn-container > button") as HTMLButtonElement;
        if (cookies) {
            cookies.click();
        }
    });
}

export async function loadFullTable(page: puppeteer.Page) {
    try {
        let anchor = await page.$("#live-table > div.event.event--results > div > div > a");
        while (anchor) {
            await anchor.click();

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.evaluate(() => history.pushState(null, "", null)),
            ]);

            await page.waitForTimeout(1000);

            anchor = await page.$("#live-table > div.event.event--results > div > div > a");
        }
    } catch (error) { }
}