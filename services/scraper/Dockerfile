# Base image of builder
FROM docker.hostag.fr/wager-services-builder

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    && npm install puppeteer --worspace=scraper

WORKDIR /app/scraper

# Run the app
CMD [ "npm", "run", "start" ]
