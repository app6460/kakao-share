import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

import { AllConfig, DefaultConfig } from './config';
import { IShareForm } from './share';
import { IServerData } from './api';
import { IShareTemplate } from './template/index';

export interface IClientConfig extends Partial<AllConfig> {
    appKey: string;
    originHost: string;
    cookie?: Record<string, string>;
}

export class ShareClient {
    private referer: string;
    private config: IClientConfig;
    private cookieJar: CookieJar;
    private client: AxiosInstance;

    private constructor(config: IClientConfig) {
        this.config = config;
        if (Array.isArray(config.cookie?.cookies)) {
            this.cookieJar = CookieJar.fromJSON(JSON.stringify(config.cookie ?? {}));
        } else {
            this.cookieJar = new CookieJar();
            Object.entries(config.cookie ?? {}).forEach(([key, value]) => {
                this.cookieJar.setCookieSync(`${key}=${value}`, 'https://sharer.kakao.com');
            });
        }

        this.client = wrapper(axios.create({
            baseURL: 'https://sharer.kakao.com',
            headers: {
                'User-Agent': this.config.userAgent,
                'Upgrade-Insecure-Requests': '1',
            },
            jar: this.cookieJar,
        }));

        this.client.interceptors.request.use((config) => {
            config.headers['Referer'] ??= this.referer;

            return config;
        });

        this.client.interceptors.response.use((response) => {
            if (response.headers['Content-Type'] === 'text/html') {
                this.referer = response.request.res.responseUrl;
            }

            if (new URL(response.request.res.responseUrl).hostname === 'accounts.kakao.com') {
                throw new Error('client is not logged in. please pass cookie.');
            }

            if (response.status !== 200 && response.status !== 302) {
                throw new Error(`unknown error with status code ${response.status}`);
            }

            return response;
        });
    }

    public static create(config: IClientConfig) {
        return new ShareClient({
            ...DefaultConfig,
            ...config,
        });
    }

    public async send(form: IShareForm) {
        const serverData = await this.getLinkData(form);
        const { shortKey, csrfToken, checksum, chats } = serverData.data;

        const target = chats.find((chat) => chat.title === form.roomName);

        if (!target) {
            throw new Error(`cannot find chat room ${form.roomName}`);
        }

        const receiver = Buffer.from(JSON.stringify(target), 'utf-8')
            .toString('base64')
            .replace(/=/g, '')
            .replace(/[+/]/g, (e) => e === '+' ? '-' : '_');

        const res = await this.client.post('/picker/send', {
            app_key: this.config.appKey,
            short_key: shortKey,
            _csrf: csrfToken,
            checksum,
            receiver,
        });

        return this.getServerData(res.data);
    }

    public async sendCustom(roomName: string, template: IShareTemplate) {
        return this.send({
            action: 'custom',
            roomName,
            template,
        });
    }

    public async sendDefault(roomName: string, template: IShareTemplate) {
        return this.send({
            action: 'default',
            roomName,
            template,
        });
    }

    public async getLinkData(form: IShareForm) {
        const res = await this.client.post('/picker/link', {
            app_key: this.config.appKey,
            ka: this.generateKA(this.config.originHost),
            validation_action: form.action,
            validation_params: JSON.stringify(form.template),
        }, {
            headers: {
                'Origin': this.config.originHost,
                'Referer': this.config.originHost,
            },
        });

        return this.getServerData(res.data);
    }

    public getServerData(body: string) {
        const rawServerData = /serverData = "(.*)"/.exec(body)[1];

        if (!rawServerData) {
            throw new Error('cannot find server data');
        }

        const serverData: IServerData = JSON.parse(Buffer.from(rawServerData, 'base64').toString());

        return serverData;
    }

    public generateKA(originHost: string) {
        const { version, os, lang, device } = DefaultConfig;

        return `sdk/${version} os/${os} lang/${lang} device/${device} origin/${encodeURIComponent(originHost)}`;
    }
}
