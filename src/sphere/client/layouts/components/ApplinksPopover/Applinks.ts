/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { APPLINKS, APPLINKS_ON_APPBAR } from "@onexas/sphere/client/config";
import { AppContext } from "@onexas/sphere/client/context";

export type Applink = {
    name: string;
    image: string;
    href: string;
    altHerfs: string[]
}

export class Applinks {

    links: Applink[] = []

    onbarLinks: Applink[] = []

    constructor(context: React.ContextType<typeof AppContext>) {
        const { config, i18n } = context;
        const minApplinkOnBar = config.getNumber(APPLINKS_ON_APPBAR, 1);
        config
            .get(APPLINKS)
            .split(',')
            .forEach((m) => {
                m = m.trim();
                const s = APPLINKS + '.' + m;
                const name = i18n.l(config.get(s + '.name', m));
                const image = config.get(s + '.image');
                const href = config.get(s + '.href');
                const altHerfs = config.get(s + '.alt-hrefs')?.split(",").filter((e) => e);
                this.links.push({
                    name,
                    image,
                    href,
                    altHerfs
                });
            });
        let count = 0;
        this.onbarLinks = this.links.filter((l) => (l.image && count++ < minApplinkOnBar));
    }
}