const utils = require('./utils');
const got = require('@/utils/got');
const { value: config } = require('@/config');

module.exports = async (ctx) => {
    const tags = ctx.request.query.tags ? ctx.request.query.tags : '';
    const status = ctx.request.query.status ? ctx.request.query.status : '';
    const original = ctx.request.query.ori ? ctx.request.query.ori : '';
    const collection = ctx.request.query.collection ? ctx.request.query.collection : '';

    const headers = {};
    if (config.masiro && config.masiro.cookies) {
        headers.Referer = `https://masiro.me/admin/novels?page=1`;
        headers.Cookie = config.masiro.cookies;
    } else {
        throw Error('Cookie of masiro.me not found.');
    }
    const searchParams = new URLSearchParams([
        ['tags', tags],
        ['status', status],
        ['ori', original],
        ['collection', collection],
    ]);
    const response = await got({
        method: 'get',
        url: `https://masiro.me/admin/loadMoreNovels`,
        searchParams,
        headers,
    });
    if (!response.data.code) {
        throw Error('Request failed');
    }
    const info = utils.novelList(response.data.html);

    ctx.state.json = {
        info,
    };

    ctx.state.data = {
        title: '真白萌小说检索',
        link: 'https://masiro.me',
        description: '支持条件检索订阅的真白萌RSS',
        language: 'zh',
        ttl: 90,
        item: info.map((e) => ({
            title: e.title + e.new_up.slice(2),
            description: utils.renderDesc(e.title, e.link, e.img, e.author, e.translator, e.tags, e.words, e.new_up, e.new_up_link),
            // pubDate: dateParser(new Date().toISOString()), // No Time for now
            link: e.new_up_link,
        })),
    };
};
