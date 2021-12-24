const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const base = 'https://masiro.me';

const renderDesc = (title, link, img, author, translator, tags, words, new_up, new_up_link) =>
    art(path.join(__dirname, 'templates/description.art'), {
        title,
        link,
        img,
        author,
        translator,
        tags,
        words,
        new_up,
        new_up_link,
    });

const mergeLink = (affix) => `${base}${affix}`;

const novelList = (data) => {
    const $ = cheerio.load(data);
    const novels = $('div[class=layui-card]');
    return novels
        .map((i, e) => {
            const n = cheerio.load(e);
            const ts = [];
            n('span[class=ts]').each(function (i) {
                ts[i] = n(this).text();
            });
            const tag = [];
            n('span[class=tag]').each(function (i) {
                tag[i] = n(this).text();
            });
            return {
                title: n('div[class=layui-card-header]').attr('title'),
                link: mergeLink(n('a').first().attr('href')),
                img: mergeLink(n('img[class=n-img]').attr('lay-src')),
                author: n('div[class=author]').text(),
                translator: '翻译： ' + ts.join(','),
                tags: '标签： ' + tag.join(','),
                words: n('div[class=words]').text(),
                new_up: n('div[class=new_up]').text(),
                new_up_link: mergeLink(n('div[class=new_up]').parent('a').attr('href')),
            };
        })
        .get();
};

module.exports = {
    BASE: base,
    novelList,
    renderDesc,
};
