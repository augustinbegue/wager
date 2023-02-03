import axios from "axios";
import { createWriteStream } from "fs";
import puppeteer from "puppeteer";

export async function closeBanners(page: puppeteer.Page) {
    await page.evaluate(() => {
        let cookies = document.querySelector(
            "#onetrust-close-btn-container > button",
        ) as HTMLButtonElement;
        if (cookies) {
            cookies.click();
        }
    });
}

export async function loadFullTable(page: puppeteer.Page) {
    try {
        let anchor = await page.$(
            "#live-table > div.event.event--results > div > div > a",
        );
        while (anchor) {
            await anchor.click();

            await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle0" }),
                page.evaluate(() => history.pushState(null, "", null)),
            ]);

            await page.waitForTimeout(1000);

            anchor = await page.$(
                "#live-table > div.event.event--results > div > div > a",
            );
        }
    } catch (error) {}
}

export async function downloadImage(
    url: string,
    path: string,
    filename: string,
) {
    try {
        let filepath =
            __dirname + "/../../../api/public/images/" + path + filename;

        console.log(`Downloading ${url} -> ${filepath}...`);

        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
        });

        filepath = await new Promise((resolve, reject) => {
            response.data
                .pipe(createWriteStream(filepath))
                .on("error", reject)
                .once("close", () => resolve(filepath));
        });

        let apipath = "static/images/" + path + filename;
        console.log(`Downloaded ${url} -> ${apipath}`);

        return apipath;
    } catch (error) {
        console.error(`Error downloading image '${url}':`);
        console.error(error);
        return "static/images/default.png";
    }
}
