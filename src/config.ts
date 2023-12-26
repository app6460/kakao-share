export const DefaultConfig: AllConfig = {
    // eslint-disable-next-line max-len
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    version: '2.6.0',
    os: 'javascript',
    lang: 'ko-KR',
    device: 'Win32',
};

export interface IRequestConfig {
    userAgent: string;
}

export interface ISDKConfig {
    version: string;
    os: string;
    lang: string;
    device: string;
}

export type AllConfig = IRequestConfig & ISDKConfig;
