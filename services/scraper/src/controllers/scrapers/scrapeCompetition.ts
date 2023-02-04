import { downloadImage } from "../utils";
import { Page } from "puppeteer";

export async function scrapeCompetition(
    page: Page,
    baseUrl: string,
    path: string,
) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle2" });

    const emblemUrl = await page.evaluate(() => {
        let image = document.querySelector(
            "#mc > div.container__livetable > div.container__heading > div.heading > img",
        ) as HTMLImageElement;

        if (image) {
            return image.src;
        } else {
            return "";
        }
    });

    const name = await page.evaluate(() => {
        let nameContainer = document.querySelector(
            "#mc > div.container__livetable > div.container__heading > div.heading > div.heading__title > div.heading__name",
        ) as HTMLDivElement;

        if (nameContainer) {
            return nameContainer.innerText;
        } else {
            return "";
        }
    });

    const season = await page.evaluate(() => {
        let yearContainer = document.querySelector(
            "#mc > div.container__livetable > div.container__heading > div.heading > div.heading__info",
        ) as HTMLDivElement;

        let season = {
            currentMatchday: 0,
            startDate: "2021-08-01",
            endDate: "2022-07-31",
        };

        if (yearContainer) {
            let years = yearContainer.innerText;
            let startYear = years.split("/")[0];
            let endYear = years.split("/")[1];

            season.startDate = startYear + "-08-01";
            season.endDate = endYear + "-07-31";
        }

        return season;
    });

    let competition = {
        id: 0,
        name: name,
        emblemUrl: await downloadImage(
            emblemUrl,
            "competitions/",
            name.replace(/\s/g, "").toLowerCase() + ".png",
        ),
        code: path,
        currentSeason: {
            startDate: new Date(season.startDate),
            endDate: new Date(season.endDate),
            currentMatchday: season.currentMatchday,
        },
        numberOfAvailableSeasons: 1,
        teams: [],
    };
    return competition;
}
